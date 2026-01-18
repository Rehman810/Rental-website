import Listing from '../../model/listingModel/index.js';
import TemporaryBooking from '../../model/temporaryBooking/index.js';
import ConfirmedBooking from '../../model/confirmBooking/index.js';
import sendConfirmationEmail from '../../config/confirmEmail/index.js';
import Stripe from 'stripe'; // Import the Stripe module
const stripeClient= Stripe(process.env.STRIPE_KEY); 
import Host from '../../model/hostModel/index.js'

export const bookingController = {

createBooking: async (req, res) => {
  try {
    const { listingId } = req.params;
    const { startDate, endDate, guestCapacity, paymentMethodId } = req.body;
    if (!startDate || !endDate || !guestCapacity || !paymentMethodId) {
      return res.status(400).json({ message: 'Missing required fields.' });
    }
    const parsedStartDate = new Date(startDate);
    const parsedEndDate = new Date(endDate);
    if (parsedStartDate >= parsedEndDate) {
      return res.status(400).json({ message: 'End date must be after start date.' });
    }
    const listing = await Listing.findById(listingId);
    if (!listing) {
      return res.status(404).json({ message: 'Listing not found.' });
    }
    if (guestCapacity > listing.guestCapacity) {
      return res.status(400).json({ message: 'Guest capacity exceeds limit.' });
    }
    const totalNights = Math.ceil((parsedEndDate - parsedStartDate) / (1000 * 60 * 60 * 24));
    let totalPrice = 0;
    for (let i = 0; i < totalNights; i++) {
      const currentDay = new Date(parsedStartDate);
      currentDay.setDate(currentDay.getDate() + i);
      const isWeekend = [0, 4].includes(currentDay.getDay());
      totalPrice += isWeekend ? listing.weekendActualPrice : listing.weekdayActualPrice;
    }
    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: totalPrice * 100, // Convert to cents
      currency: 'pkr', 
      payment_method: paymentMethodId, 
      confirm: false,
      setup_future_usage: 'off_session', 

    });
    const booking = await TemporaryBooking.create({
      userId: req.user._id,
      listingId,
      startDate: parsedStartDate,
      endDate: parsedEndDate,
      guestCapacity,
      totalPrice,
      paymentIntentId: paymentIntent.id,
    });
    res.status(201).json({
      message: 'Booking created.',
      booking,
      clientSecret: paymentIntent.client_secret,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

confirmBooking: async (req, res) => {
  try {
    const { bookingId } = req.params;

    const temporaryBooking = await TemporaryBooking.findById(bookingId);
    if (!temporaryBooking) {
      return res.status(404).json({ message: 'Booking not found.' });
    }
    const { listingId, startDate, endDate, userId, paymentIntentId } = temporaryBooking;
    const existingConfirmedBooking = await ConfirmedBooking.findOne({
      listingId,
      $or: [
        { startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } },
      ],
    });
    if (existingConfirmedBooking) {
      return res.status(400).json({ message: 'Dates already confirmed for another booking.' });
    }
    const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'requires_confirmation') {
      const confirmedPaymentIntent = await stripeClient.paymentIntents.confirm(paymentIntentId, {
        payment_method: paymentIntent.payment_method, 
        return_url: 'http://localhost:4000/', 

      });

      if (confirmedPaymentIntent.status === 'succeeded') {
        const confirmedBooking = await ConfirmedBooking.create({
          userId,
          listingId,
          startDate,
          endDate,
          guestCapacity: temporaryBooking.guestCapacity,
          totalPrice: temporaryBooking.totalPrice,
        });

        await TemporaryBooking.findByIdAndDelete(bookingId);

        res.status(201).json({ message: 'Booking confirmed.', confirmedBooking });
      } else {
        return res.status(400).json({ message: 'Payment not completed successfully after confirmation.' });
      }
    } else {
      return res.status(400).json({ message: 'Payment not in a valid state for confirmation.' });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

deleteBooking: async (req, res) => {
  try {
    const { bookingId } = req.params; 
    
    const deletedBooking = await TemporaryBooking.findByIdAndDelete(bookingId);

    if (deletedBooking) {
      return res.status(200).json({ message: 'Booking rejected', deletedBooking });
    } else {
      return res.status(404).json({ message: 'Booking not found' });
    }
  } catch (error) {
    console.error('Error deleting booking:', error); 
    return res.status(500).json({ message: 'Internal server error', error: error.message });
  }
},

getTemporaryBookings: async (req, res) => {
  try {
    const listings = await Listing.find({ hostId: req.user._id }).select('_id');
    console.log("listings",listings)
    if (listings.length === 0) {
      return res.status(404).json({ message: 'No listings found for this host.' });
    }
    const listingIds = listings.map((listing) => listing._id);
    const bookings = await TemporaryBooking.find({ listingId: { $in: listingIds } })
      .populate('listingId')
      .exec();

    if (bookings.length === 0) {
      return res.status(200).json({ message: 'No temporary bookings found for this host.' });
    }
    const bookingsWithUserData = await Promise.all(
      bookings.map(async (booking) => {
        const userData = await Host.findById(booking.userId);

        return {
          ...booking.toObject(),
          userSpecificData: userData
            ? {
                name: userData.userName,
                email: userData.email,
                photoProfile: userData.photoProfile,
                phoneNumber: userData.phoneNumber,

              }
            : null,
        };
      })
    );

    return res.status(200).json({count:bookings.length, bookings: bookingsWithUserData });
  } catch (error) {
    console.error('Error fetching temporary bookings:', error);
    return res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

getConfirmedBookings: async (req, res) => {
    try {
      console.log("req user",req.user)
      const listings = await Listing.find({ hostId: req.user._id })
      const listingIds = listings.map((listing) => listing._id);
      const bookings = await ConfirmedBooking.find({ listingId: { $in: listingIds } }).populate('listingId');
    
      res.status(200).json({ bookings });
    } catch (error) {
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},

getBookingsCheckingOutToday: async (req, res) => {
    try {
        const today = new Date();
        today.setUTCHours(0, 0, 0, 0);
        const listings = await Listing.find({ hostId: req.user._id }).select('_id');
        const listingIds = listings.map((listing) => listing._id);
        if (listingIds.length === 0) {
            return res.status(200).json({ message: "No listings found for this host.", bookingsCheckingOutToday: [] });
        }
        const bookings = await ConfirmedBooking.find({
            listingId: { $in: listingIds },
            endDate: today, 
        }).populate('listingId');

        const bookingsWithUserData = await Promise.all(
            bookings.map(async (booking) => {
                const userData = await Host.findById(booking.userId); 

                return {
                    ...booking.toObject(),
                    userSpecificData: userData
                        ? {
                            name: userData.userName,
                            email: userData.email,
                            photoProfile: userData.photoProfile,
                            phoneNumber:userData.phoneNumber

                        }
                        : null,
                };
            })
        );

        return res.status(200).json({ count: bookings.length, bookingsCheckingOutToday: bookingsWithUserData });
    } catch (error) {
        console.error('Error fetching bookings checking out today:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
},

getCurrentlyHostingBookings: async (req, res) => {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0); 
    const hostId = req.user._id;
    const listings = await Listing.find({ hostId }).select('_id');
    const listingIds = listings.map((listing) => listing._id);

    if (listingIds.length === 0) {
      return res.status(200).json({ message: "No listings found for this host.", currentlyHostingBookings: [] });
    }

    const currentlyHostingBookings = await ConfirmedBooking.find({
      listingId: { $in: listingIds },
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).populate('listingId');

    const bookingsWithUserData = await Promise.all(
      currentlyHostingBookings.map(async (booking) => {
        const userData = await Host.findById(booking.userId);  
        return {
          ...booking.toObject(),
          userSpecificData: userData
            ? {
                name: userData.userName,
                email: userData.email,
                photoProfile: userData.photoProfile,
                phoneNumber: userData.phoneNumber,
              }
            : null,
        };
      })
    );

    res.status(200).json({ currentlyHostingBookings: bookingsWithUserData });
  } catch (error) {
    console.error('Error fetching currently hosting bookings:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

getUpcomingBookings: async (req, res) => {
  try {
    const today = new Date();
    const hostId = req.user._id;

    const listings = await Listing.find({ hostId }).select('_id');
    const listingIds = listings.map((listing) => listing._id);

    if (listingIds.length === 0) {
      return res.status(200).json({ message: "No listings found for this host.", upcomingBookings: [] });
    }

    const upcomingBookings = await ConfirmedBooking.find({
      listingId: { $in: listingIds },
      startDate: { $gt: today },
    }).populate('listingId');

    const bookingsWithUserData = await Promise.all(
      upcomingBookings.map(async (booking) => {
        const userData = await Host.findById(booking.userId);

        return {
          ...booking.toObject(),
          userSpecificData: userData
            ? {
                name: userData.userName,
                email: userData.email,
                photoProfile: userData.photoProfile,
                phoneNumber: userData.phoneNumber,
              }
            : null,
        };
      })
    );

    res.status(200).json({ upcomingBookings: bookingsWithUserData });
  } catch (error) {
    console.error('Error fetching upcoming bookings:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

getUserBookings: async (req, res) => {
  try {
    const userId = req.user._id;

    const [temporaryBookings, confirmedBookings] = await Promise.all([
      TemporaryBooking.find({ userId })
        .populate({
          path: 'listingId',
          populate: { path: 'hostId', select: 'userName email photoProfile' },
        })
        .exec(),
      ConfirmedBooking.find({ userId })
        .populate({
          path: 'listingId',
          populate: { path: 'hostId', select: 'userName email photoProfile' },
        })
        .exec(),
    ]);

    const allBookings = [...temporaryBookings, ...confirmedBookings];

    if (allBookings.length === 0) {
      return res.status(200).json({ message: 'No bookings found for this user.', userBookings: [] });
    }

    const bookingsWithDetails = allBookings.map((booking) => {
      const bookingData = booking.toObject();
      const status = booking instanceof TemporaryBooking ? 'Pending' : 'Confirmed';

      const hostData = bookingData.listingId?.hostId;
      const { hostId, ...listingDetails } = bookingData.listingId || {};

      return {
        _id: bookingData._id,
        userId: bookingData.userId,
        listingId: {
          ...listingDetails,
          id: listingDetails._id,
        },
        startDate: bookingData.startDate,
        endDate: bookingData.endDate,
        guestCapacity: bookingData.guestCapacity,
        totalPrice: bookingData.totalPrice,
        paymentIntentId: bookingData.paymentIntentId,
        createdAt: bookingData.createdAt,
        __v: bookingData.__v,
        status,
        hostData: hostData
          ? {
              userName: hostData.userName,
              email: hostData.email,
              photoProfile: hostData.photoProfile,
            }
          : null, 
      };
    });

    res.status(200).json({ userBookings: bookingsWithDetails });
  } catch (error) {
    console.error('Error fetching user bookings:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
},

getConfirmedBookingDates: async (req, res) => {
  try {
    const hostId = req.user.id;

    const listings = await Listing.find({ hostId }).select('_id');  
    const listingIds = listings.map((listing) => listing._id);

    if (listingIds.length === 0) {
      return res.status(200).json({ message: "No listings found for this host.", bookingDates: [] });
    }

    const confirmedBookings = await ConfirmedBooking.find({
      listingId: { $in: listingIds },
    })
      .select('startDate endDate listingId userId guestCapacity totalPrice')
      .populate('userId', 'userName email photoProfile phoneNumber'); 

    const bookingDates = confirmedBookings.map((booking) => ({
      listingId: booking.listingId,
      startDate: booking.startDate,
      endDate: booking.endDate,
      guestCapacity: booking.guestCapacity,
      totalPrice: booking.totalPrice,
      guestData: booking.userId
        ? {
            name: booking.userId.userName,
            email: booking.userId.email,
            photoProfile: booking.userId.photoProfile,
            phoneNumber: booking.userId.phoneNumber,
          }
        : null,
    }));

    if (bookingDates.length === 0) {
      return res.status(200).json({ message: "No confirmed bookings found for this host.", bookingDates: [] });
    }

    res.status(200).json({ bookingDates });
  } catch (error) {
    console.error('Error fetching confirmed bookings:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}

  
};


