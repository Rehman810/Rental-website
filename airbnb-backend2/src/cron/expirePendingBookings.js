import cron from 'node-cron';
import TemporaryBooking from '../model/temporaryBooking/index.js';
import Stripe from 'stripe';
import dotenv from 'dotenv';

dotenv.config();

const stripeClient = Stripe(process.env.STRIPE_KEY);

export const expirePendingBookings = async () => {
    try {
        console.log('[Cron] Starting expirePendingBookings job...');

        const now = new Date();
        const expiryTime = new Date(now.getTime() - 24 * 60 * 60 * 1000); // 24 hours ago

        // Find bookings that are pending_approval and older than 24 hours
        const expiredBookings = await TemporaryBooking.find({
            status: 'pending_approval',
            createdAt: { $lte: expiryTime }
        });

        if (expiredBookings.length === 0) {
            console.log('[Cron] No expired bookings found.');
            return { expiredCount: 0 };
        }

        console.log(`[Cron] Found ${expiredBookings.length} expired bookings to process.`);

        let processedCount = 0;

        for (const booking of expiredBookings) {
            try {
                // Cancel PaymentIntent
                if (booking.paymentIntentId) {
                    try {
                        // Check status first to avoid error if already canceled
                        const verifyIntent = await stripeClient.paymentIntents.retrieve(booking.paymentIntentId);
                        if (verifyIntent.status !== 'canceled') {
                            await stripeClient.paymentIntents.cancel(booking.paymentIntentId);
                            console.log(`[Cron] Cancelled PaymentIntent ${booking.paymentIntentId} for booking ${booking._id}`);
                        }
                    } catch (stripeError) {
                        console.warn(`[Cron] Warning: Failed to cancel PaymentIntent ${booking.paymentIntentId} for booking ${booking._id}:`, stripeError.message);
                        // Continue to expire the booking even if stripe fails (as per requirements)
                    }
                }

                // Update booking status to expired
                booking.status = 'expired';
                await booking.save();
                processedCount++;

            } catch (err) {
                console.error(`[Cron] Error processing booking ${booking._id}:`, err.message);
            }
        }

        console.log(`[Cron] Successfully expired ${processedCount} bookings.`);
        return { expiredCount: processedCount };

    } catch (error) {
        console.error('[Cron] Critical Error in expirePendingBookings job:', error);
        throw error;
    }
};

// Run every 10 minutes
// Cron expression: */10 * * * *
export const startCronJob = () => {
    cron.schedule('*/10 * * * *', () => {
        expirePendingBookings();
    });
    console.log('[Cron] expirePendingBookings scheduler started (runs every 10 mins).');
};
