import Listing from '../../model/listingModel/index.js';
import TemporaryBooking from '../../model/temporaryBooking/index.js';
import ConfirmedBooking from '../../model/confirmBooking/index.js';
import sendConfirmationEmail from '../../config/confirmEmail/index.js'; // Keep if used elsewhere or remove
import { sendAppEmail, EMAIL_TYPES } from '../../config/email/sendAppEmail.js';
import Stripe from 'stripe'; // Import the Stripe module
const stripeClient = Stripe(process.env.STRIPE_KEY);
import Host from '../../model/hostModel/index.js'
import { FRONTEND_BASE_URL } from '../../config/appConfig.js';
import { createNotification, NOTIFICATION_TYPES } from '../../config/notifications/notificationService.js';
import CancellationPolicy from '../../model/cancellationPolicy/index.js';

export const bookingController = {

  createStripeAccount: async (req, res) => {
    try {
      const hostId = req.user._id;

      const account = await stripeClient.accounts.create({
        type: "express",
        country: "PK",
        email: req.user.email,
      });

      await Host.findByIdAndUpdate(hostId, { stripeAccountId: account.id });

      const accountLink = await stripeClient.accountLinks.create({
        account: account.id,
        refresh_url: `${FRONTEND_BASE_URL}/host/onboarding/refresh`,
        return_url: `${FRONTEND_BASE_URL}/host/onboarding/success`,
        type: "account_onboarding",
      });

      return res.status(200).json({
        message: "Stripe onboarding link created",
        url: accountLink.url,
        stripeAccountId: account.id,
      });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  createBooking: async (req, res) => {
    try {
      const { listingId } = req.params;
      const { startDate, endDate, guestCapacity, paymentMethodId } = req.body;
      if (!startDate || !endDate || !guestCapacity) {
        return res.status(400).json({ message: 'Missing required fields.' });
      }
      const parsedStartDate = new Date(startDate);
      const parsedEndDate = new Date(endDate);
      if (parsedStartDate >= parsedEndDate) {
        return res.status(400).json({ message: 'End date must be after start date.' });
      }

      // Populate hostId to check Stripe connection and settings
      const listing = await Listing.findById(listingId).populate('hostId');
      if (!listing) {
        return res.status(404).json({ message: 'Listing not found.' });
      }

      const host = listing.hostId;
      if (!host || !host.stripeAccountId) {
        return res.status(400).json({ message: 'Host has not connected Stripe' });
      }

      // --- Guest Requirements Validation ---
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

      const guest = await Host.findById(req.user._id); // Fetch fresh guest data
      const missingRequirements = [];

      if (effectiveRequirements.requireVerifiedPhone) {
        // Check if phone exists. Assuming 'valid' means exists for now.
        // User model has phoneNumber (Number).
        if (!guest.phoneNumber) missingRequirements.push('verified_phone');
      }

      if (effectiveRequirements.requireCNIC) {
        if (!guest.CNIC || !guest.CNIC.isVerified) missingRequirements.push('cnic_verified');
      }

      if (effectiveRequirements.requireVerifiedEmail) {
        if (!guest.isEmailVerified) missingRequirements.push('verified_email');
      }

      if (effectiveRequirements.requireProfilePhoto) {
        if (!guest.photoProfile) missingRequirements.push('profile_photo');
      }

      if (effectiveRequirements.minAccountAgeDays > 0) {
        const accountAge = (new Date() - new Date(guest.createdAt)) / (1000 * 60 * 60 * 24);
        if (accountAge < effectiveRequirements.minAccountAgeDays) {
          missingRequirements.push(`account_age_${effectiveRequirements.minAccountAgeDays}_days`);
        }
      }

      if (effectiveRequirements.requireCompletedProfile) {
        // Basic Profile Check: Name, Email, Phone, Photo
        if (!guest.userName || !guest.email || !guest.phoneNumber || !guest.photoProfile) {
          missingRequirements.push('completed_profile');
        }
      }

      if (missingRequirements.length > 0) {
        return res.status(400).json({
          message: "Guest does not meet booking requirements",
          missing: missingRequirements
        });
      }
      // --- End Guest Requirements Validation ---

      // Determine booking mode: Listing Override > Host Default > System Default ('request')
      const bookingMode = listing.bookingMode ?? host.settings?.bookingMode ?? 'request';

      // --- Availability Validation Start ---
      const availability = host.settings?.availability || {};

      const effectiveMinNights = listing.minNights ?? availability.minNights ?? 1;
      const effectiveMaxNights = listing.maxNights ?? availability.maxNights ?? 30;
      // allowSameDayBooking is mainly for UI/Logic consistency, minNoticeDays drives the check
      const effectiveMinNoticeDays = listing.minNoticeDays ?? availability.minNoticeDays ?? 1;
      const effectiveBookingWindowMonths = listing.bookingWindowMonths ?? availability.bookingWindowMonths ?? 6;

      const stayDuration = Math.ceil((parsedEndDate - parsedStartDate) / (1000 * 60 * 60 * 24));

      if (stayDuration < effectiveMinNights) {
        return res.status(400).json({ message: `Minimum stay is ${effectiveMinNights} nights.` });
      }
      if (stayDuration > effectiveMaxNights) {
        return res.status(400).json({ message: `Maximum stay is ${effectiveMaxNights} nights.` });
      }

      // Times set to midnight for pure date comparison
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const checkInDate = new Date(parsedStartDate);
      checkInDate.setHours(0, 0, 0, 0);

      const diffTime = checkInDate - today;
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays < 0) {
        return res.status(400).json({ message: "Cannot book in the past." });
      }

      if (diffDays < effectiveMinNoticeDays) {
        return res.status(400).json({ message: `Advance notice of ${effectiveMinNoticeDays} days required.` });
      }

      const maxFutureDate = new Date(today);
      maxFutureDate.setMonth(maxFutureDate.getMonth() + effectiveBookingWindowMonths);

      if (checkInDate > maxFutureDate) {
        return res.status(400).json({ message: `Booking dates are too far in advance. Max ${effectiveBookingWindowMonths} months allowed.` });
      }
      // --- Availability Validation End ---

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

      const totalAmountCents = Math.round(totalPrice * 100);
      // Platform fee 10%
      const platformFeeCents = Math.round(totalAmountCents * 0.10);

      const paymentIntent = await stripeClient.paymentIntents.create({
        amount: totalAmountCents,
        currency: "pkr",
        automatic_payment_methods: { enabled: true },
        application_fee_amount: platformFeeCents,
        capture_method: "manual", // ALWAYS manual first
        transfer_data: {
          destination: host.stripeAccountId,
        },
      });

      const booking = await TemporaryBooking.create({
        userId: req.user._id,
        listingId,
        startDate: parsedStartDate,
        endDate: parsedEndDate,
        guestCapacity,
        totalPrice,
        paymentIntentId: paymentIntent.id,
        status: 'on_hold' // waiting for user to authorize payment
      });
      res.status(201).json({
        message: 'Booking created. Proceed to payment.',
        booking,
        clientSecret: paymentIntent.client_secret,
        bookingMode: bookingMode
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  // Called after payment authorization if bookingMode is 'request'
  requestBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await TemporaryBooking.findById(bookingId);
      if (!booking) return res.status(404).json({ message: "Booking not found." });

      // Verify payment intent status (it should be 'requires_capture' or 'succeeded' if auth worked)
      const paymentIntent = await stripeClient.paymentIntents.retrieve(booking.paymentIntentId);
      if (paymentIntent.status !== 'requires_capture') {
        // If not authorized yet, we shouldn't move to pending_approval
        // UNLESS it's already succeeded (unlikely with manual capture)
        // Or if the payment flow failed.
        return res.status(400).json({ message: "Payment authorization failed or incomplete." });
      }

      booking.status = 'pending_approval';
      await booking.save();

      // Email Notifications
      const fullBooking = await TemporaryBooking.findById(booking._id)
        .populate('userId')
        .populate({ path: 'listingId', populate: { path: 'hostId' } });

      const guestUser = fullBooking.userId;
      const listing = fullBooking.listingId;
      const hostUser = listing.hostId;

      // Email to Host
      await sendAppEmail({
        to: hostUser.email,
        type: EMAIL_TYPES.BOOKING_PENDING_HOST,
        payload: {
          userName: hostUser.userName,
          listingTitle: listing.title,
          startDate: booking.startDate,
          endDate: booking.endDate,
          guestCapacity: booking.guestCapacity,
          totalPrice: booking.totalPrice,
          bookingId: booking._id,
          actionUrl: `${FRONTEND_BASE_URL}/host/dashboard/requests`
        }
      });

      // Email to Guest
      await sendAppEmail({
        to: guestUser.email,
        type: EMAIL_TYPES.BOOKING_PENDING_GUEST,
        payload: {
          userName: guestUser.userName,
          listingTitle: listing.title,
          startDate: booking.startDate,
          endDate: booking.endDate,
          guestCapacity: booking.guestCapacity,
          totalPrice: booking.totalPrice,
          bookingId: booking._id,
        }
      });

      // Notification to Host
      await createNotification({
        userId: hostUser._id,
        type: NOTIFICATION_TYPES.BOOKING_PENDING_APPROVAL_HOST,
        role: 'host',
        title: 'New Booking Request',
        message: `${guestUser.userName} requested to book ${listing.title}`,
        data: {
          bookingId: booking._id,
          listingId: listing._id,
          actionUrl: '/host/dashboard/requests'
        }
      });

      // Notification to Guest
      await createNotification({
        userId: guestUser._id,
        type: NOTIFICATION_TYPES.BOOKING_PENDING_APPROVAL_GUEST,
        role: 'guest',
        title: 'Booking Request Sent',
        message: `Your request for ${listing.title} has been sent to the host.`,
        data: {
          bookingId: booking._id,
          listingId: listing._id,
          actionUrl: '/trips'
        }
      });

      return res.status(200).json({ message: "Request sent to host.", booking });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  // Called by Host to approve
  approveBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      // Ensure user is host of this listing
      // We need to populate listing to check host
      const booking = await TemporaryBooking.findById(bookingId).populate('listingId');
      if (!booking) return res.status(404).json({ message: "Booking not found." });

      if (booking.listingId.hostId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to approve this booking." });
      }

      if (booking.status !== 'pending_approval') {
        return res.status(400).json({ message: "Booking is not in pending state." });
      }

      // Check overlap
      const existingConfirmedBooking = await ConfirmedBooking.findOne({
        listingId: booking.listingId._id,
        $or: [{ startDate: { $lte: new Date(booking.endDate) }, endDate: { $gte: new Date(booking.startDate) } }],
        $nor: [{ status: 'CANCELLED', cancelledBy: 'GUEST' }, { status: 'Cancelled', cancelledBy: 'GUEST' }]
      });

      if (existingConfirmedBooking) {
        return res.status(400).json({ message: "Dates are no longer available (booked/blocked)." });
      }

      // Capture Payment
      const paymentIntent = await stripeClient.paymentIntents.retrieve(booking.paymentIntentId);
      if (paymentIntent.status === "requires_capture") {
        const capturedIntent = await stripeClient.paymentIntents.capture(booking.paymentIntentId);
        if (capturedIntent.status !== "succeeded") {
          return res.status(400).json({ message: "Payment capture failed.", status: capturedIntent.status });
        }
      }

      // Fetch Policy Snapshot
      const listing = await Listing.findById(booking.listingId._id).populate('cancellationPolicy');
      let policySnapshot = { name: 'Flexible', rules: {} }; // Default fallback

      if (listing.cancellationPolicy) {
        policySnapshot = {
          name: listing.cancellationPolicy.name,
          rules: listing.cancellationPolicy.rules
        };
      } else {
        const defaultPolicy = await CancellationPolicy.findOne({ name: 'Flexible', type: 'PREDEFINED' });
        if (defaultPolicy) {
          policySnapshot = { name: defaultPolicy.name, rules: defaultPolicy.rules };
        }
      }

      // Move to Confirmed
      const confirmedBooking = await ConfirmedBooking.create({
        userId: booking.userId,
        listingId: booking.listingId._id,
        startDate: booking.startDate,
        endDate: booking.endDate,
        guestCapacity: booking.guestCapacity,
        totalPrice: booking.totalPrice,
        paymentIntentId: booking.paymentIntentId,
        cancellationPolicy: policySnapshot,
        checkIn: booking.startDate
      });

      await TemporaryBooking.findByIdAndDelete(bookingId);

      return res.status(200).json({ message: "Booking approved and confirmed.", confirmedBooking });

      // Send Emails (Non-blocking)
      (async () => {
        try {
          const guestUser = await Host.findById(booking.userId);
          const hostUser = booking.listingId.hostId; // Already populated

          // Email to Guest
          await sendAppEmail({
            to: guestUser.email,
            type: EMAIL_TYPES.BOOKING_CONFIRMED_GUEST,
            payload: {
              userName: guestUser.userName,
              listingTitle: booking.listingId.title,
              startDate: booking.startDate,
              endDate: booking.endDate,
              guestCapacity: booking.guestCapacity,
              totalPrice: booking.totalPrice,
              bookingId: confirmedBooking._id,
              actionUrl: `${FRONTEND_BASE_URL}/trips`
            }
          });

          // Email to Host
          await sendAppEmail({
            to: hostUser.email,
            type: EMAIL_TYPES.BOOKING_CONFIRMED_HOST,
            payload: {
              userName: hostUser.userName,
              listingTitle: booking.listingId.title,
              startDate: booking.startDate,
              endDate: booking.endDate,
              guestCapacity: booking.guestCapacity,
              totalPrice: booking.totalPrice,
              bookingId: confirmedBooking._id,
            }
          });

          // Notification to Guest
          await createNotification({
            userId: guestUser._id,
            type: NOTIFICATION_TYPES.BOOKING_APPROVED_GUEST,
            role: 'guest',
            title: 'Booking Approved!',
            message: `Your booking for ${booking.listingId.title} is confirmed.`,
            data: {
              bookingId: confirmedBooking._id,
              listingId: booking.listingId._id,
              actionUrl: `/trips`
            }
          });

          // Notification to Host
          await createNotification({
            userId: hostUser._id,
            type: NOTIFICATION_TYPES.BOOKING_APPROVED_HOST,
            role: 'host',
            title: 'Booking Confirmed',
            message: `You accepted the booking for ${booking.listingId.title}.`,
            data: {
              bookingId: confirmedBooking._id,
              listingId: booking.listingId._id,
              actionUrl: '/host/dashboard'
            }
          });
        } catch (err) {
          console.error("Error sending approval emails", err);
        }
      })();

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  // Called by Host to reject
  rejectBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await TemporaryBooking.findById(bookingId).populate('listingId');
      if (!booking) return res.status(404).json({ message: "Booking not found." });

      if (booking.listingId.hostId.toString() !== req.user._id.toString()) {
        return res.status(403).json({ message: "Not authorized to reject this booking." });
      }

      // Cancel Payment Intent
      try {
        await stripeClient.paymentIntents.cancel(booking.paymentIntentId);
      } catch (e) {
        console.warn("Failed to cancel payment intent:", e.message);
        // Continue to delete booking anyway
      }

      await TemporaryBooking.findByIdAndDelete(bookingId);

      // Email to Guest
      try {
        const guestUser = await Host.findById(booking.userId);
        await sendAppEmail({
          to: guestUser.email,
          type: EMAIL_TYPES.BOOKING_REJECTED_GUEST,
          payload: {
            userName: guestUser.userName,
            listingTitle: booking.listingId.title,
            startDate: booking.startDate,
            endDate: booking.endDate,
            totalPrice: booking.totalPrice,
            bookingId: booking._id,
            rejectionReason: req.body.reason || 'Dates unavailable or other reasons.'
          }
        });
      } catch (e) { console.error("Error sending rejection email", e) }

      // Notification to Guest
      const guestUser = await Host.findById(booking.userId);
      if (guestUser) {
        await createNotification({
          userId: guestUser._id,
          type: NOTIFICATION_TYPES.BOOKING_REJECTED_GUEST,
          role: 'guest',
          title: 'Booking Rejected',
          message: `Your booking for ${booking.listingId.title} was rejected.`,
          data: {
            listingId: booking.listingId._id,
            actionUrl: '/'
          }
        });
      }

      return res.status(200).json({ message: "Booking rejected." });

    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  confirmBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;

      const temporaryBooking = await TemporaryBooking.findById(bookingId);
      if (!temporaryBooking) {
        return res.status(404).json({ message: "Booking not found." });
      }

      const { listingId, startDate, endDate, userId, paymentIntentId } = temporaryBooking;

      const existingConfirmedBooking = await ConfirmedBooking.findOne({
        listingId,
        $or: [{ startDate: { $lte: new Date(endDate) }, endDate: { $gte: new Date(startDate) } }],
        $nor: [{ status: 'CANCELLED', cancelledBy: 'GUEST' }, { status: 'Cancelled', cancelledBy: 'GUEST' }]
      });

      if (existingConfirmedBooking) {
        return res.status(400).json({ message: "Dates already confirmed for another booking." });
      }

      const paymentIntent = await stripeClient.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status === "requires_capture") {
        const capturedIntent = await stripeClient.paymentIntents.capture(paymentIntentId);

        if (capturedIntent.status !== "succeeded") {
          return res.status(400).json({
            message: "Payment capture failed.",
            status: capturedIntent.status,
          });
        }
      }

      else if (paymentIntent.status === "succeeded") {
      }

      else {
        return res.status(400).json({
          message: "Payment is not in a valid state for confirmation.",
          status: paymentIntent.status,
        });
      }

      // Fetch Policy
      const listingObj = await Listing.findById(listingId).populate('cancellationPolicy');
      let policySnapshot = { name: 'Flexible', rules: {} };
      if (listingObj && listingObj.cancellationPolicy) {
        policySnapshot = {
          name: listingObj.cancellationPolicy.name,
          rules: listingObj.cancellationPolicy.rules
        };
      } else {
        const defaultPolicy = await CancellationPolicy.findOne({ name: 'Flexible', type: 'PREDEFINED' });
        if (defaultPolicy) {
          policySnapshot = { name: defaultPolicy.name, rules: defaultPolicy.rules };
        }
      }

      const confirmedBooking = await ConfirmedBooking.create({
        userId,
        listingId,
        startDate,
        endDate,
        guestCapacity: temporaryBooking.guestCapacity,
        totalPrice: temporaryBooking.totalPrice,
        paymentIntentId,
        cancellationPolicy: policySnapshot,
        checkIn: startDate
      });

      await TemporaryBooking.findByIdAndDelete(bookingId);

      return res.status(201).json({ message: "Booking confirmed.", confirmedBooking });
    } catch (error) {
      return res.status(500).json({ message: "Internal Server Error", error: error.message });
    }
  },

  cancelBooking: async (req, res) => {
    try {
      const { bookingId } = req.params;
      const booking = await ConfirmedBooking.findById(bookingId).populate('listingId');
      if (!booking) return res.status(404).json({ message: "Booking not found." });

      const isGuest = booking.userId.toString() === req.user._id.toString();
      const listingHostId = booking.listingId.hostId.toString();
      const isHost = listingHostId === req.user._id.toString();

      if (!isGuest && !isHost) {
        return res.status(403).json({ message: "Not authorized." });
      }

      if (booking.status === 'CANCELLED') {
        return res.status(400).json({ message: "Booking already cancelled." });
      }

      const now = new Date();
      const checkIn = new Date(booking.startDate);
      const bookingDate = new Date(booking.createdAt);

      const policy = booking.cancellationPolicy;
      let refundAmount = 0;
      let notes = "";

      if (isGuest) {
        const hoursSinceBooking = (now - bookingDate) / (1000 * 60 * 60);
        const hoursBeforeCheckIn = (checkIn - now) / (1000 * 60 * 60);
        const amountPaid = booking.totalPrice;

        // Ensure policy exists, fallback if missing
        const rules = policy ? policy.rules : { fullRefundHours: 24, noRefundAfterCheckIn: true };

        if (rules.fullRefundHours && hoursSinceBooking <= rules.fullRefundHours) {
          refundAmount = amountPaid;
          notes = "Full refund (within grace period)";
        } else if (rules.noRefundAfterCheckIn && now >= checkIn) {
          refundAmount = 0;
          notes = "No refund after check-in";
        } else {
          if (rules.partialRefundBeforeCheckIn && rules.partialRefundBeforeCheckIn.enabled) {
            if (hoursBeforeCheckIn >= rules.partialRefundBeforeCheckIn.hoursBeforeCheckIn) {
              refundAmount = Math.round((amountPaid * rules.partialRefundBeforeCheckIn.percentage) / 100);
              notes = `Partial refund (${rules.partialRefundBeforeCheckIn.percentage}%)`;
            } else {
              refundAmount = 0;
              notes = "Past partial refund cutoff";
            }
          } else {
            refundAmount = 0;
            notes = "No refund per policy";
          }
        }
      } else {
        refundAmount = booking.totalPrice;
        notes = "Host cancelled (Full Refund)";
        // Host penalty logic here
      }

      // Process Refund via Stripe (Mocked/Commented)
      if (refundAmount > 0 && booking.paymentIntentId) {
        try {
          // await stripeClient.refunds.create({
          //   payment_intent: booking.paymentIntentId,
          //   amount: Math.round(refundAmount * 100),
          // });
        } catch (err) {
          console.error("Stripe refund failed", err);
        }
      }

      booking.status = 'CANCELLED';
      booking.cancelledBy = isGuest ? 'GUEST' : 'HOST';
      booking.refundAmount = refundAmount;
      await booking.save();

      return res.status(200).json({ message: "Booking cancelled.", refundAmount, notes });

    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: error.message });
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
      console.log("listings", listings)
      if (listings.length === 0) {
        return res.status(404).json({ message: 'No listings found for this host.' });
      }
      const listingIds = listings.map((listing) => listing._id);

      // Filter? For now return all. Frontend can filter by status 'pending_approval' vs 'on_hold'.
      // Ideally 'on_hold' are just abandoned carts, host shouldn't see them usually.
      // But let's return all and let UI decided.
      const bookings = await TemporaryBooking.find({
        listingId: { $in: listingIds },
        status: { $ne: 'expired' }
      })
        .populate('listingId')
        .exec();

      if (bookings.length === 0) {
        return res.status(200).json({ message: 'No temporary bookings found for this host.', bookings: [] });
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

      return res.status(200).json({ count: bookings.length, bookings: bookingsWithUserData });
    } catch (error) {
      console.error('Error fetching temporary bookings:', error);
      return res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  getConfirmedBookings: async (req, res) => {
    try {
      console.log("req user", req.user)
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
                phoneNumber: userData.phoneNumber
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
        // Updated status logic
        let status = 'Confirmed';
        if (booking instanceof TemporaryBooking) {
          status = bookingData.status === 'pending_approval' ? 'Pending Approval' : 'Pending Payment';
        }

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
          cancellationPolicy: bookingData.cancellationPolicy,
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


