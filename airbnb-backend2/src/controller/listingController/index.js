import listingModel from '../../model/listingModel/index.js';
import Listing from '../../model/listingModel/index.js';
import temporaryListingSchema from '../../model/temporaryLIsting/index.js';
import Host from '../../model/hostModel/index.js'
import Review from '../../model/reviewListings/index.js';
import Notification from '../../model/notification/index.js';
import CancellationPolicy from '../../model/cancellationPolicy/index.js';

export const listingController = {

  createListing: async (req, res) => {
    try {
      console.log('--- createListing Request ---');
      console.log('Files received:', req.files ? req.files.length : 'No files');
      console.log('Body:', JSON.stringify(req.body, null, 2));

      const host = await Host.findById(req.user._id);
      if (!host) {
        return res.status(404).json({ message: "Host not found." });
      }

      const {
        placeType, roomType, guestCapacity, bedrooms, beds, bathrooms, amenities,
        title, description, street, flat, city, town, postcode,
        latitude, longitude, listingType = 'SHORT_TERM',
        wifiPassword, checkInInstructions
      } = req.body;

      // Extract prices and configs
      let { weekdayPrice, weekendPrice, leaseConfig, saleConfig } = req.body;

      if (!req.files || req.files.length < 3) {
        return res.status(400).json({ message: 'At least 3 photos are required.' });
      }

      const photos = req.files.map((file) => file.path);

      // Parse configs if they come as strings (Multipart form-data)
      if (typeof leaseConfig === 'string') {
        try { leaseConfig = JSON.parse(leaseConfig); } catch (e) { console.error("Error parsing leaseConfig", e); }
      }
      if (typeof saleConfig === 'string') {
        try { saleConfig = JSON.parse(saleConfig); } catch (e) { console.error("Error parsing saleConfig", e); }
      }

      // Validation based on Listing Type
      if (listingType === 'SHORT_TERM') {
        if (!weekdayPrice || isNaN(weekdayPrice)) {
          return res.status(400).json({ message: 'Valid weekdayPrice is required for short-term listings.' });
        }
        if (!weekendPrice || isNaN(weekendPrice)) {
          return res.status(400).json({ message: 'Valid weekendPrice is required for short-term listings.' });
        }
      } else if (listingType === 'LONG_TERM') {
        if (!leaseConfig || !leaseConfig.monthlyRent) {
          return res.status(400).json({ message: 'Monthly rent is required for long-term listings.' });
        }
      } else if (listingType === 'FOR_SALE') {
        if (!saleConfig || !saleConfig.salePrice) {
          return res.status(400).json({ message: 'Sale price is required for property sales.' });
        }
      }

      const amenitiesArray = Array.isArray(amenities)
        ? amenities
        : typeof amenities === 'string'
          ? amenities.split(',').map((item) => item.trim())
          : [];

      const newListing = new temporaryListingSchema({
        hostId: req.user._id,
        listingType,
        placeType,
        roomType,
        guestCapacity,
        bedrooms,
        beds,
        bathrooms,
        amenities: amenitiesArray,
        photos,
        title,
        description,
        weekdayPrice: listingType === 'SHORT_TERM' ? parseFloat(weekdayPrice) : 0,
        weekendPrice: listingType === 'SHORT_TERM' ? parseFloat(weekendPrice) : 0,
        leaseConfig: listingType === 'LONG_TERM' ? leaseConfig : undefined,
        saleConfig: listingType === 'FOR_SALE' ? saleConfig : undefined,
        street,
        flat,
        city,
        town,
        postcode,
        latitude,
        longitude,
        wifiPassword,
        checkInInstructions
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
          hostId: hostData?._id
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
      const listing = await Listing.findById(id).populate('confirmedBookings').populate('cancellationPolicy');

      if (!listing) {
        return res.status(404).json({ message: 'Listing not found' });
      }
      const hostData = await Host.findById(listing.hostId);
      const hostSelectedData = {
        userName: hostData?.userName,
        email: hostData?.email,
        photoProfile: hostData?.photoProfile,
        CNICStatus: hostData?.CNIC?.isVerified,
        hostId: hostData?._id
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

      // Calculate Effective Booking Mode
      // Note: listing.bookingMode might be undefined
      const effectiveBookingMode = listing.bookingMode ?? hostData.settings?.bookingMode ?? 'request';

      // Calculate Effective availability
      const availabilitySettings = hostData.settings?.availability || {};
      const effectiveAvailability = {
        minNights: listing.minNights ?? availabilitySettings.minNights ?? 1,
        maxNights: listing.maxNights ?? availabilitySettings.maxNights ?? 30,
        allowSameDayBooking: listing.allowSameDayBooking ?? availabilitySettings.allowSameDayBooking ?? false,
        minNoticeDays: listing.minNoticeDays ?? availabilitySettings.minNoticeDays ?? 1,
        bookingWindowMonths: listing.bookingWindowMonths ?? availabilitySettings.bookingWindowMonths ?? 6,
        checkInFrom: listing.checkInFrom ?? availabilitySettings.checkInFrom ?? "14:00",
        checkOutBy: listing.checkOutBy ?? availabilitySettings.checkOutBy ?? "11:00"
      };

      // Calculate Effective Guest Requirements
      const hostReqs = hostData.settings?.guestRequirements || {};
      const overrideReqs = listing.guestRequirementsOverride || {};
      const effectiveGuestRequirements = {
        requireVerifiedPhone: overrideReqs.requireVerifiedPhone ?? hostReqs.requireVerifiedPhone ?? false,
        requireCNIC: overrideReqs.requireCNIC ?? hostReqs.requireCNIC ?? false,
        requireVerifiedEmail: overrideReqs.requireVerifiedEmail ?? hostReqs.requireVerifiedEmail ?? false,
        requireProfilePhoto: overrideReqs.requireProfilePhoto ?? hostReqs.requireProfilePhoto ?? false,
        minAccountAgeDays: overrideReqs.minAccountAgeDays ?? hostReqs.minAccountAgeDays ?? 0,
        requireCompletedProfile: overrideReqs.requireCompletedProfile ?? hostReqs.requireCompletedProfile ?? false,
      };

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
        effectiveBookingMode, // Return this!
        cancellationPolicy: listing.cancellationPolicy, // Explicit return for debugging
        listing: {
          ...listing.toObject(),
          effectiveBookingMode, // Also inside listing object for convenience
          effectiveAvailability, // Return effective rules
          effectiveGuestRequirements, // Return effective requirements
          cancellationPolicy: listing.cancellationPolicy, // Force include
          bookings: listing.confirmedBookings.map(booking => ({
            userId: booking.userId,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalPrice: booking.totalPrice,
            totalPrice: booking.totalPrice,
            bookingDate: booking.createdAt,
            status: booking.status,
            cancelledBy: booking.cancelledBy
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
      const { userId: loggedInUserId, page, limit } = req.query;
      const skip = (page - 1) * limit;

      const query = loggedInUserId
        ? { hostId: { $ne: loggedInUserId }, status: { $ne: 'disabled' } }
        : { status: { $ne: 'disabled' } };

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

  updateBookingMode: async (req, res) => {
    try {
      const { listingId } = req.params;
      const { bookingMode } = req.body; // 'instant', 'request', or null

      const hostId = req.user._id;
      const listing = await Listing.findOne({ _id: listingId, hostId });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found or unauthorized." });
      }

      if (bookingMode === null) {
        listing.bookingMode = undefined; // Mongoose will use $unset
      } else {
        listing.bookingMode = bookingMode;
      }

      await listing.save();

      // Recalculate effective mode to return
      const host = await Host.findById(hostId);
      const effectiveBookingMode = listing.bookingMode ?? host.settings?.bookingMode ?? 'request';

      return res.status(200).json({
        message: "Booking mode updated.",
        bookingMode: listing.bookingMode,
        effectiveBookingMode
      });

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  migrateBookingModes: async (req, res) => {
    try {
      const hostId = req.user?._id;
      // If admin, could migrate all. But user asked for "Script or Endpoint".
      // Let's make it migrate GLOBAL or Just for HOST.
      // Safety: Migrate all listings where bookingMode is 'request' (the old default) to undefined
      // SO they inherit host default properly.
      // BUT: Host might WANT 'request' override.
      // BETTER STRATEGY: Migration endpoint simply unsets ALL listings bookingMode for the requesting host?
      // OR: Unsets bookingMode if it matches 'request'.
      // Let's implement a bulk unset for the current host's listings to "Use Host Default".

      if (!hostId) return res.status(400).json({ message: "Host ID required" });

      await Listing.updateMany(
        { hostId: hostId },
        { $unset: { bookingMode: 1 } }
      );

      return res.status(200).json({ message: "All your listings migrated to use Host Default settings." });

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  updateAvailability: async (req, res) => {
    try {
      const { listingId } = req.params;
      const {
        minNights, maxNights, allowSameDayBooking, minNoticeDays,
        bookingWindowMonths, checkInFrom, checkOutBy, status, unavailableDates
      } = req.body;

      const hostId = req.user._id;
      const listing = await Listing.findOne({ _id: listingId, hostId });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found or unauthorized." });
      }

      // Helper to update or unset
      const updateField = (field, value) => {
        if (value === null) {
          listing[field] = undefined; // Unset
        } else if (value !== undefined) {
          listing[field] = value;
        }
      };

      updateField('minNights', minNights);
      updateField('maxNights', maxNights);
      updateField('allowSameDayBooking', allowSameDayBooking);
      updateField('minNoticeDays', minNoticeDays);
      updateField('bookingWindowMonths', bookingWindowMonths);
      updateField('checkInFrom', checkInFrom);
      updateField('checkOutBy', checkOutBy);
      updateField('status', status);
      updateField('unavailableDates', unavailableDates);

      await listing.save();

      // Calculate effective values
      const host = await Host.findById(hostId);
      const hostSettings = host.settings?.availability || {};

      const effective = {
        minNights: listing.minNights ?? hostSettings.minNights ?? 1,
        maxNights: listing.maxNights ?? hostSettings.maxNights ?? 30,
        allowSameDayBooking: listing.allowSameDayBooking ?? hostSettings.allowSameDayBooking ?? false,
        minNoticeDays: listing.minNoticeDays ?? hostSettings.minNoticeDays ?? 1,
        bookingWindowMonths: listing.bookingWindowMonths ?? hostSettings.bookingWindowMonths ?? 6,
        checkInFrom: listing.checkInFrom ?? hostSettings.checkInFrom ?? "14:00",
        checkOutBy: listing.checkOutBy ?? hostSettings.checkOutBy ?? "11:00"
      };

      res.status(200).json({
        message: "Availability settings updated",
        overrides: {
          minNights: listing.minNights,
          maxNights: listing.maxNights,
          allowSameDayBooking: listing.allowSameDayBooking,
          minNoticeDays: listing.minNoticeDays,
          bookingWindowMonths: listing.bookingWindowMonths,
          checkInFrom: listing.checkInFrom,
          checkOutBy: listing.checkOutBy,
          status: listing.status,
          unavailableDates: listing.unavailableDates
        },
        effective
      });

    } catch (error) {
      console.error('Error updating availability:', error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  updateGuestRequirements: async (req, res) => {
    try {
      const { listingId } = req.params;
      const {
        requireVerifiedPhone,
        requireCNIC,
        requireVerifiedEmail,
        requireProfilePhoto,
        minAccountAgeDays,
        requireCompletedProfile
      } = req.body;

      const hostId = req.user._id;
      const listing = await Listing.findOne({ _id: listingId, hostId });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found or unauthorized." });
      }

      // Initialize if missing
      if (!listing.guestRequirementsOverride) {
        listing.guestRequirementsOverride = {};
      }

      // Helper to update or unset
      const updateField = (field, value) => {
        if (value === null) {
          listing.guestRequirementsOverride[field] = undefined; // Unset
        } else if (value !== undefined) {
          listing.guestRequirementsOverride[field] = value;
        }
      };

      updateField('requireVerifiedPhone', requireVerifiedPhone);
      updateField('requireCNIC', requireCNIC);
      updateField('requireVerifiedEmail', requireVerifiedEmail);
      updateField('requireProfilePhoto', requireProfilePhoto);
      updateField('minAccountAgeDays', minAccountAgeDays);
      updateField('requireCompletedProfile', requireCompletedProfile);

      await listing.save();

      // Recalculate effective rules
      const host = await Host.findById(hostId);
      const hostSettings = host.settings?.guestRequirements || {};
      const overrides = listing.guestRequirementsOverride || {};

      const effectiveRequirements = {
        requireVerifiedPhone: overrides.requireVerifiedPhone ?? hostSettings.requireVerifiedPhone ?? false,
        requireCNIC: overrides.requireCNIC ?? hostSettings.requireCNIC ?? false,
        requireVerifiedEmail: overrides.requireVerifiedEmail ?? hostSettings.requireVerifiedEmail ?? false,
        requireProfilePhoto: overrides.requireProfilePhoto ?? hostSettings.requireProfilePhoto ?? false,
        minAccountAgeDays: overrides.minAccountAgeDays ?? hostSettings.minAccountAgeDays ?? 0,
        requireCompletedProfile: overrides.requireCompletedProfile ?? hostSettings.requireCompletedProfile ?? false,
      };

      return res.status(200).json({
        message: "Guest requirements updated.",
        overrides: listing.guestRequirementsOverride,
        effectiveRequirements
      });

    } catch (error) {
      console.error('Error updating guest requirements:', error);
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  updateCancellationPolicy: async (req, res) => {
    try {
      const { listingId } = req.params;
      const { policyId } = req.body;

      const hostId = req.user._id;
      const listing = await Listing.findOne({ _id: listingId, hostId });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found or unauthorized." });
      }

      if (policyId) {
        const policy = await CancellationPolicy.findById(policyId);
        if (!policy) return res.status(404).json({ message: "Policy not found." });

        if (policy.type === 'CUSTOM' && policy.createdBy.toString() !== hostId.toString()) {
          return res.status(403).json({ message: "Unauthorized to use this policy." });
        }

        listing.cancellationPolicy = policyId;
      } else {
        // Fallback to Flexible if nothing provided?
        // Or specific logic. For now, unset it (will likely fallback to default in logic)
        // But better to enforce finding 'Flexible' and setting it if user wants to "remove" custom.
        // Actually, let's just allow setting.
        listing.cancellationPolicy = undefined;
      }

      await listing.save();
      await listing.populate('cancellationPolicy');

      return res.status(200).json({
        message: "Cancellation policy updated.",
        cancellationPolicy: listing.cancellationPolicy
      });

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  updateAiAssistant: async (req, res) => {
    try {
      const { listingId } = req.params;
      const { autoReplyEnabled, aiSummary } = req.body;

      const hostId = req.user._id;
      const listing = await Listing.findOne({ _id: listingId, hostId });

      if (!listing) {
        return res.status(404).json({ message: "Listing not found or unauthorized." });
      }

      if (autoReplyEnabled !== undefined) listing.autoReplyEnabled = autoReplyEnabled;
      if (aiSummary !== undefined) listing.aiSummary = aiSummary;

      await listing.save();

      res.status(200).json({
        message: "AI Assistant settings updated",
        autoReplyEnabled: listing.autoReplyEnabled,
        aiSummary: listing.aiSummary
      });

    } catch (error) {
      console.error('Error updating AI settings:', error);
      res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  }

};

