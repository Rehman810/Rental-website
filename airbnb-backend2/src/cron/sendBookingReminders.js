
import cron from 'node-cron';
import ConfirmedBooking from '../model/confirmBooking/index.js';
import { sendAppEmail, EMAIL_TYPES } from '../config/email/sendAppEmail.js';
import { FRONTEND_BASE_URL } from '../config/appConfig.js';
import { createNotification, NOTIFICATION_TYPES } from '../config/notifications/notificationService.js';

export const sendBookingReminders = async () => {
    try {
        console.log('[Cron] Starting sendBookingReminders job...');

        // Target: Bookings starting tomorrow (approx 24 hours from now)
        // Implementation: Find bookings where startDate is "tomorrow" AND reminderSent is false.

        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);
        tomorrow.setHours(0, 0, 0, 0);

        const dayAfterTomorrow = new Date(tomorrow);
        dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1);

        // Find bookings with startDate >= tomorrow 00:00 and < dayAfterTomorrow 00:00
        const upcomingBookings = await ConfirmedBooking.find({
            startDate: { $gte: tomorrow, $lt: dayAfterTomorrow },
            reminderSent: { $ne: true }
        }).populate('userId').populate({ path: 'listingId', populate: { path: 'hostId' } });

        if (upcomingBookings.length === 0) {
            console.log('[Cron] No upcoming bookings for reminder.');
            return;
        }

        console.log(`[Cron] Found ${upcomingBookings.length} bookings to remind.`);

        for (const booking of upcomingBookings) {
            try {
                const guest = booking.userId;
                const listing = booking.listingId;
                const host = listing?.hostId;

                const fullAddress = [
                    listing?.flat,
                    listing?.street,
                    listing?.town,
                    listing?.city,
                    listing?.postcode
                ].filter(Boolean).join(', ');

                // Send to Guest
                if (guest && guest.email) {
                    await sendAppEmail({
                        to: guest.email,
                        type: EMAIL_TYPES.BOOKING_REMINDER_GUEST,
                        payload: {
                            userName: guest.userName,
                            listingTitle: listing?.title || 'Listing',
                            startDate: booking.startDate,
                            endDate: booking.endDate,
                            guestCapacity: booking.guestCapacity,
                            totalPrice: booking.totalPrice,
                            bookingId: booking._id,
                            actionUrl: `${FRONTEND_BASE_URL}/trips`,
                            fullAddress,
                            hostPhone: host?.phoneNumber,
                            wifiPassword: listing?.wifiPassword,
                            checkInInstructions: listing?.checkInInstructions
                        }
                    });
                }

                // Notification to Guest
                if (guest) {
                    await createNotification({
                        userId: guest._id,
                        type: NOTIFICATION_TYPES.BOOKING_REMINDER_24H_GUEST,
                        role: 'guest',
                        title: 'Upcoming Trip',
                        message: `Your trip to ${listing?.title || 'Listing'} starts tomorrow!`,
                        data: {
                            bookingId: booking._id,
                            actionUrl: '/trips'
                        }
                    });
                }

                // Send to Host
                if (host && host.email) {
                    await sendAppEmail({
                        to: host.email,
                        type: EMAIL_TYPES.BOOKING_REMINDER_HOST,
                        payload: {
                            userName: host.userName,
                            listingTitle: listing?.title || 'Listing',
                            startDate: booking.startDate,
                            endDate: booking.endDate,
                            guestCapacity: booking.guestCapacity,
                            totalPrice: booking.totalPrice,
                            bookingId: booking._id,
                            actionUrl: `${FRONTEND_BASE_URL}/host/dashboard`
                        }
                    });
                }

                // Notification to Host
                if (host) {
                    await createNotification({
                        userId: host._id,
                        type: NOTIFICATION_TYPES.BOOKING_REMINDER_24H_HOST,
                        role: 'host',
                        title: 'Upcoming Booking',
                        message: `Guest ${guest?.userName} arrives tomorrow at ${listing?.title}.`,
                        data: {
                            bookingId: booking._id,
                            actionUrl: '/host/dashboard/reservations'
                        }
                    });
                }

                // Mark as sent
                booking.reminderSent = true;
                await booking.save();

            } catch (err) {
                console.error(`[Cron] Error sending reminder for booking ${booking._id}:`, err);
            }
        }

        console.log('[Cron] Reminders sent.');

    } catch (error) {
        console.error('[Cron] Error in sendBookingReminders:', error);
    }
};

export const startReminderCron = () => {
    // Run every hour to check
    cron.schedule('0 * * * *', () => {
        sendBookingReminders();
    });
    console.log('[Cron] Reminder scheduler started (runs every hour).');
};
