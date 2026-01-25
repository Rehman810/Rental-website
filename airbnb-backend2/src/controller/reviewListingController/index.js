import Review from '../../model/reviewListings/index.js';
import ConfirmedBooking from '../../model/confirmBooking/index.js';
import Listing from '../../model/listingModel/index.js';

const updateListingStats = async (listingId) => {
  try {
    const reviews = await Review.find({ listingId });
    if (!reviews.length) {
      await Listing.findByIdAndUpdate(listingId, {
        ratingAvg: 0,
        ratingCount: 0,
        ratingDetails: { cleanliness: 0, location: 0, communication: 0, value: 0 }
      });
      return;
    }

    const count = reviews.length;
    let sumCleanliness = 0, sumLocation = 0, sumCommunication = 0, sumValue = 0, sumOverall = 0;

    reviews.forEach(r => {
      sumCleanliness += r.ratings.cleanliness;
      sumLocation += r.ratings.location;
      sumCommunication += r.ratings.communication;
      sumValue += r.ratings.value;
      sumOverall += r.overallRating;
    });

    await Listing.findByIdAndUpdate(listingId, {
      ratingAvg: parseFloat((sumOverall / count).toFixed(2)),
      ratingCount: count,
      ratingDetails: {
        cleanliness: parseFloat((sumCleanliness / count).toFixed(2)),
        location: parseFloat((sumLocation / count).toFixed(2)),
        communication: parseFloat((sumCommunication / count).toFixed(2)),
        value: parseFloat((sumValue / count).toFixed(2))
      }
    });
  } catch (error) {
    console.error('Error updating listing stats:', error);
  }
};

export const reviewListingController = {
  addReview: async (req, res) => {
    try {
      // Logic handled validation via middleware ideally, but we do it here
      const { listingId, bookingId, ratings, comment } = req.body;
      const guestId = req.user._id;

      let parsedRatings = ratings;
      if (typeof ratings === 'string') {
        try {
          parsedRatings = JSON.parse(ratings);
        } catch (e) {
          return res.status(400).json({ message: 'Invalid ratings format' });
        }
      }

      if (!parsedRatings || !parsedRatings.cleanliness || !parsedRatings.location || !parsedRatings.communication || !parsedRatings.value) {
        return res.status(400).json({ message: 'All rating categories are required.' });
      }

      const overallRating = (
        (Number(parsedRatings.cleanliness) + Number(parsedRatings.location) + Number(parsedRatings.communication) + Number(parsedRatings.value)) / 4
      ).toFixed(2);

      const booking = await ConfirmedBooking.findOne({ _id: bookingId, userId: guestId, listingId });

      if (!booking) {
        return res.status(403).json({ message: 'Invalid booking for review.' });
      }

      // Check if booking is completed
      if (new Date(booking.endDate) > new Date()) {
        return res.status(400).json({ message: 'Cannot review a stay that has not completed.' });
      }

      const existingReview = await Review.findOne({ bookingId, guestId });
      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this booking.' });
      }

      const photos = req.files ? req.files.map(f => f.path) : [];

      // Get hostId from Listing to ensure accuracy
      const listing = await Listing.findById(listingId);
      if (!listing) return res.status(404).json({ message: 'Listing not found' });

      const review = new Review({
        listingId,
        bookingId,
        guestId,
        hostId: listing.hostId, // Use listing host details
        ratings: parsedRatings,
        overallRating,
        comment,
        photos
      });

      await review.save();
      await updateListingStats(listingId);

      res.status(201).json({ message: 'Review added successfully.', review });
    } catch (error) {
      console.error('Error adding review:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  getReviewsByListingId: async (req, res) => {
    try {
      const { listingId } = req.params;
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 5;

      const reviews = await Review.find({ listingId })
        .populate('guestId', 'userName email photoProfile') // Assuming User model fields
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);

      const totalReviews = await Review.countDocuments({ listingId });

      // Fetch Listing for overall stats
      const listing = await Listing.findById(listingId).select('ratingAvg ratingCount ratingDetails');

      res.status(200).json({
        reviews,
        totalReviews,
        totalPages: Math.ceil(totalReviews / limit),
        currentPage: page,
        listingStats: listing
      });
    } catch (error) {
      console.error('Error fetching reviews:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  addHostResponse: async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { message } = req.body;
      const hostId = req.user._id;

      const review = await Review.findById(reviewId);
      if (!review) return res.status(404).json({ message: 'Review not found' });

      // Verify host owns this listing or is the host assigned to review
      // The review.hostId is the listing owner
      if (review.hostId.toString() !== hostId.toString()) {
        return res.status(403).json({ message: 'Only the host can respond to this review.' });
      }

      review.hostResponse = {
        message,
        respondedAt: new Date()
      };
      await review.save();

      res.status(200).json({ message: 'Response added.', review });
    } catch (error) {
      res.status(500).json({ message: 'Error adding response', error: error.message });
    }
  },

  canReview: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const userId = req.user._id;

      const booking = await ConfirmedBooking.findById(bookingId);
      if (!booking) return res.status(404).json({ canReview: false, reason: 'Booking not found' });

      if (booking.userId.toString() !== userId.toString()) {
        return res.status(403).json({ canReview: false, reason: 'Not your booking' });
      }

      if (new Date(booking.endDate) > new Date()) {
        return res.status(200).json({ canReview: false, reason: 'Stay not completed' });
      }

      const existingReview = await Review.findOne({ bookingId });
      if (existingReview) {
        return res.status(200).json({ canReview: false, reason: 'Already reviewed' });
      }

      res.status(200).json({ canReview: true });
    } catch (error) {
      res.status(500).json({ message: 'Error checking review status', error: error.message });
    }
  }
};
