import Stripe from 'stripe';
import Host from '../../model/hostModel/index.js';
import TemporaryBooking from '../../model/temporaryBooking/index.js';
import ConfirmedBooking from '../../model/confirmBooking/index.js';
import { FRONTEND_BASE_URL } from '../../config/appConfig.js';

const stripe = new Stripe(process.env.STRIPE_KEY);

export const stripeController = {
    createConnectAccount: async (req, res) => {
        try {
            const host = await Host.findById(req.user._id);
            if (!host) {
                return res.status(404).json({ message: "Host not found" });
            }

            let accountId = host.stripeAccountId;
            if (!accountId) {
                const account = await stripe.accounts.create({
                    type: 'express',
                    // Assuming PK based on existing code, or US. Express supports many.
                    // Ideally catch error if country not supported.
                    // Let's use user email.
                    url: "https://pakbnb.com",
                    email: host.email,
                });
                accountId = account.id;
                host.stripeAccountId = accountId;
                await host.save();
            }

            const accountLink = await stripe.accountLinks.create({
                account: accountId,
                refresh_url: `${FRONTEND_BASE_URL}/hosting/payments`,
                return_url: `${FRONTEND_BASE_URL}/hosting/payments`,
                type: 'account_onboarding',
            });

            res.status(200).json({ url: accountLink.url });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    getAccountStatus: async (req, res) => {
        try {
            const host = await Host.findById(req.user._id);
            if (!host || !host.stripeAccountId) {
                return res.status(200).json({
                    charges_enabled: false,
                    payouts_enabled: false,
                    details_submitted: false
                });
            }

            const account = await stripe.accounts.retrieve(host.stripeAccountId);

            const isCompleted = account.details_submitted && account.charges_enabled && account.payouts_enabled;

            if (isCompleted && !host.stripeOnboardingCompleted) {
                host.stripeOnboardingCompleted = true;
                await host.save();
            }

            res.status(200).json({
                charges_enabled: account.charges_enabled,
                payouts_enabled: account.payouts_enabled,
                details_submitted: account.details_submitted
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: "Internal Server Error", error: error.message });
        }
    },

    webhook: async (req, res) => {
        const sig = req.headers['stripe-signature'];
        let event;

        try {
            // NOTE: req.body must be raw buffer for this to work. 
            // Ensure specific route handling for raw body in app.js or route definition
            event = stripe.webhooks.constructEvent(req.rawBody || req.body, sig, process.env.STRIPE_WEBHOOK_SECRET);
        } catch (err) {
            console.error(`Webhook signature verification failed.`, err.message);
            return res.status(400).send(`Webhook Error: ${err.message}`);
        }

        try {
            if (event.type === 'payment_intent.succeeded') {
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent succeeded: ${paymentIntent.id}`);

                const tempBooking = await TemporaryBooking.findOne({ paymentIntentId: paymentIntent.id });

                if (tempBooking) {
                    // Check if already confirmed (idempotency)
                    const existing = await ConfirmedBooking.findOne({
                        listingId: tempBooking.listingId,
                        startDate: tempBooking.startDate,
                        endDate: tempBooking.endDate
                    });

                    if (!existing) {
                        await ConfirmedBooking.create({
                            userId: tempBooking.userId,
                            listingId: tempBooking.listingId,
                            startDate: tempBooking.startDate,
                            endDate: tempBooking.endDate,
                            guestCapacity: tempBooking.guestCapacity,
                            totalPrice: tempBooking.totalPrice
                        });
                        await TemporaryBooking.findByIdAndDelete(tempBooking._id);
                    }
                }
            } else if (event.type === 'payment_intent.payment_failed') {
                const paymentIntent = event.data.object;
                console.log(`PaymentIntent failed: ${paymentIntent.id}`);
                await TemporaryBooking.findOneAndDelete({ paymentIntentId: paymentIntent.id });
            }

            res.json({ received: true });
        } catch (error) {
            console.error('Webhook handler error:', error);
            res.status(500).send('Internal Server Error');
        }
    }
};
