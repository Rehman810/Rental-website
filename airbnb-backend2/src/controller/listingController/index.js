import listingModel from '../../model/listingModel/index.js';
import Listing from '../../model/listingModel/index.js';
import temporaryListingSchema from '../../model/temporaryLIsting/index.js';
import Host from '../../model/hostModel/index.js'
import Review from '../../model/reviewListings/index.js'; 
import Notification from '../../model/notification/index.js';

export const listingController = {

  createListing: async (req, res) => {
    try {
      const host = await Host.findById(req.user._id);
      if (!host) {
        return res.status(404).json({ message: "Host not found." });
      }
  
      const {
        placeType, roomType, guestCapacity, bedrooms, beds, bathrooms, amenities,
        title, description, weekdayPrice, weekendPrice, street, flat, city, town, postcode,
        latitude, longitude
      } = req.body;
  
      if (!req.files || req.files.length < 3) {
        return res.status(400).json({ message: 'At least 3 photos are required.' });
      }
  
      const photos = req.files.map((file) => file.path);
  
      if (!weekdayPrice || isNaN(weekdayPrice)) {
        return res.status(400).json({ message: 'Valid weekdayPrice is required.' });
      }
  
      if (!weekendPrice || isNaN(weekendPrice)) {
        return res.status(400).json({ message: 'Valid weekendPrice is required.' });
      }
      const amenitiesArray = Array.isArray(amenities)
      ? amenities 
      : typeof amenities === 'string'
      ? amenities.split(',').map((item) => item.trim()) 
      : []; 
  
      const newListing = new temporaryListingSchema({
        hostId: req.user._id,
        placeType,
        roomType,
        guestCapacity,
        bedrooms,
        beds,
        bathrooms,
        amenities:amenitiesArray,
        photos,
        title,
        description,
        weekdayPrice: parseFloat(weekdayPrice),
        weekendPrice: parseFloat(weekendPrice),
        street,
        flat,
        city,
        town,
        postcode,
        latitude,
        longitude,
      });
  
      await newListing.save();
      res.status(201).json({ message: 'Listing created successfully', listing: newListing });
    } catch (error) {
      console.error('Error creating listing:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  getListingsByHostId: async (req, res) => {
    try {
      const hostId = req.params.hostId;
        const hostData = await Host.findById(hostId);
      if (!hostData) {
        return res.status(404).json({ message: 'Host not found.' });
      }
        const temporaryListings = await temporaryListingSchema.find({ hostId });
        const confirmedListings = await Listing.find({ hostId });
  
      res.status(200).json({
        message: 'Host listings fetched successfully.',
        hostDetails: {
          userName: hostData.userName,
          email: hostData.email,
          photoProfile: hostData.photoProfile,
          CNICStatus: hostData.CNIC?.isVerified || false,
        },
        temporaryListings,
        confirmedListings,
      });
    } catch (error) {
      console.error('Error fetching host listings:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  getListingById: async (req, res) => {
    try {
      const id = req.params.id;
        const listing = await Listing.findById(id).populate('confirmedBookings');
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
        const hostData = await Host.findById(listing.hostId);
      const hostSelectedData = {
        userName: hostData?.userName,
        email: hostData?.email,
        photoProfile: hostData?.photoProfile,
        CNICStatus: hostData?.CNIC?.isVerified
      };
        const reviews = await Review.find({ listingId: listing._id }).populate(
        'hostId',
        'userName email photoProfile'
      );
        let averageRating = 0;
      if (reviews.length > 0) {
        const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
        averageRating = (totalRatings / reviews.length).toFixed(1);  
      } else {
        averageRating = 0; 
      }
        const reviewData = reviews.map(review => ({
        _id: review._id,
        rating: review.rating,
        comment: review.comment,
        hostId: {
          userName: review.hostId?.userName,
          email: review.hostId?.email,
          photoProfile: review.hostId?.photoProfile
        }
      }));
        res.status(200).json({
        message: 'Listing fetched successfully',
        hostData: hostSelectedData,
        listing: {
          ...listing.toObject(),
          bookings: listing.confirmedBookings.map(booking => ({
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalPrice: booking.totalPrice,
            bookingDate: booking.createdAt
          })),
          reviews: reviewData,  
          averageRating: averageRating  
        },
      });
    } catch (error) {
      console.error('Error fetching listing:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  updateListing: async (req, res) => {
    try {
      const listingId = req.params.id;
      const { imageIndex, ...updateData } = req.body; 
      const newImage = req.file?.path; 
      const listing = await Listing.findById(listingId);
  
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found.' });
      }
        if (newImage && typeof imageIndex !== 'undefined') {
        if (!Array.isArray(listing.photos) || imageIndex < 0 || imageIndex >= listing.photos.length) {
          return res.status(400).json({ message: 'Invalid image index.' });
        }
        listing.photos[imageIndex] = newImage;
      }
        if (Object.keys(updateData).length > 0) {
        Object.keys(updateData).forEach((key) => {
          if (listing[key] !== undefined) {
            listing[key] = updateData[key];
          }
        });
      }
        await listing.save();
  
      res.status(200).json({ message: 'Listing updated successfully', listing });
    } catch (error) {
      console.error('Error updating listing:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  deleteListing: async (req, res) => {
    try {
      const listingId = req.params.id;

      const deletedListing = await Listing.findByIdAndDelete(listingId);

      if (!deletedListing) {
        return res.status(404).json({ message: 'Listing not found' });
      }

      res.status(200).json({ message: 'Listing deleted successfully' });
    } catch (error) {
      console.error('Error deleting listing:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  getAllListings: async (req, res) => {
    try {
        const { userId: loggedInUserId, page , limit } = req.query; 
        const skip = (page - 1) * limit; 

        const query = loggedInUserId 
            ? { hostId: { $ne: loggedInUserId } } 
            : {};

        const listings = await Listing.find(query)
            .populate('hostId', 'userName email photoProfile')
            .skip(skip)
            .limit(parseInt(limit)); 

        if (!listings.length) {
            return res.status(404).json({ message: 'No listings found.' });
        }
        const transformedListings = await Promise.all(
            listings.map(async (listing) => {
                const host = listing.hostId;
                const reviews = await Review.find({ listingId: listing._id });

                let averageRating = 0;
                if (reviews.length > 0) {
                    const totalRatings = reviews.reduce((sum, review) => sum + review.rating, 0);
                    averageRating = (totalRatings / reviews.length).toFixed(1);
                }

                const listingObject = listing.toObject();
                listingObject.hostData = host;
                listingObject.averageRating = averageRating;
                delete listingObject.hostId;

                return listingObject;
            })
        );
        const totalListings = await Listing.countDocuments(query);

        res.status(200).json({
            message: 'Listings fetched successfully.',
            listings: transformedListings,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalListings / limit),
                totalListings,
            },
        });
    } catch (error) {
        console.error('Error fetching listings:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},

};

