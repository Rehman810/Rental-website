import { WishlistEvent, EmailLog } from '../model/notifications/index.js';
import Wishlist from '../model/wishlist/index.js';
import Listing from '../model/listingModel/index.js';
import Host from '../model/hostModel/index.js';
import { publishEvent } from '../utils/rabbitmq.js';
import { sendAppEmail, EMAIL_TYPES } from '../config/email/sendAppEmail.js';

export const wishlistNotificationService = {
    /**
     * Handles the 'wishlist_added' event
     */
    handleWishlistAdded: async (payload) => {
        const { userId, itemId, wishlistCount } = payload;

        if (wishlistCount === 1) {
            // Schedule 24h reminder
            // In a real system, we might use a delayed queue. 
            // Here we'll rely on a cron job checking the database or Redis.
            await WishlistEvent.create({
                userId,
                eventType: 'added',
                itemId,
                metadata: {
                    reminderScheduledFor: new Date(Date.now() + 24 * 60 * 60 * 1000)
                }
            });
        }
    },

    /**
     * Checks and sends 24h reminders
     */
    processReminders: async () => {
        const now = new Date();
        const pendingReminders = await WishlistEvent.find({
            eventType: 'added',
            'metadata.reminderScheduledFor': { $lte: now },
            'metadata.reminderSent': { $ne: true }
        });

        for (const reminder of pendingReminders) {
            // Check if user still only has 1 item
            const wishlist = await Wishlist.findOne({ userId: reminder.userId });
            if (wishlist && wishlist.items.length === 1) {
                
                // Duplicate check (48h)
                const recentEmail = await EmailLog.findOne({
                    userId: reminder.userId,
                    sentAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
                });

                if (!recentEmail) {
                    const user = await Host.findById(reminder.userId);
                    const trip = await Listing.findById(reminder.itemId);
                    
                    if (user && trip) {
                        await sendAppEmail({
                            to: user.email,
                            type: EMAIL_TYPES.WISHLIST_REMINDER,
                            payload: {
                                userName: user.userName,
                                trip
                            }
                        });

                        await EmailLog.create({
                            userId: reminder.userId,
                            emailType: 'reminder',
                            tripIds: [reminder.itemId]
                        });
                    }
                }
            }

            // Mark as processed regardless of whether email was sent (to avoid re-processing)
            reminder.metadata.reminderSent = true;
            await reminder.save();
        }
    },

    /**
     * Processes weekly digests
     */
    processWeeklyDigests: async () => {
        // Get all users who added something in the last week
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        const usersToNotify = await WishlistEvent.distinct('userId', {
            createdAt: { $gte: oneWeekAgo }
        });

        for (const userId of usersToNotify) {
            const wishlist = await Wishlist.findOne({ userId }).populate('items.itemId');
            if (!wishlist || wishlist.items.length <= 1) continue;

            // Duplicate check (48h)
            const recentEmail = await EmailLog.findOne({
                userId,
                sentAt: { $gte: new Date(Date.now() - 48 * 60 * 60 * 1000) }
            });
            if (recentEmail) continue;

            // Get top 3 trips
            // Logic: 
            // 1. Most recently added
            // 2. Price drop events
            // 3. User interaction (views/clicks) - we'd need to aggregate WishlistEvent for this
            
            const interactionCounts = await WishlistEvent.aggregate([
                { $match: { userId, eventType: { $in: ['viewed', 'clicked'] } } },
                { $group: { _id: '$itemId', count: { $sum: 1 } } }
            ]);

            const priceDropTrips = await WishlistEvent.distinct('itemId', {
                userId,
                eventType: 'price_drop'
            });

            let scoredItems = wishlist.items.map(item => {
                let score = 0;
                // Recency score (simplified)
                score += (item.addedAt.getTime() / 1000000000); 
                // Price drop bonus
                if (priceDropTrips.some(id => id.toString() === item.itemId._id.toString())) score += 1000;
                // Interaction bonus
                const interaction = interactionCounts.find(i => i._id.toString() === item.itemId._id.toString());
                if (interaction) score += interaction.count * 10;
                
                return { item, score };
            });

            scoredItems.sort((a, b) => b.score - a.score);
            const top3 = scoredItems.slice(0, 3).map(si => si.item.itemId);
            const hasMore = wishlist.items.length > 5;

            const user = await Host.findById(userId);
            if (user) {
                await sendAppEmail({
                    to: user.email,
                    type: EMAIL_TYPES.WISHLIST_DIGEST,
                    payload: {
                        userName: user.userName,
                        trips: top3,
                        data: {
                            showViewAll: hasMore,
                            totalCount: wishlist.items.length
                        }
                    }
                });

                await EmailLog.create({
                    userId,
                    emailType: 'digest',
                    tripIds: top3.map(t => t._id)
                });
            }
        }
    },

    /**
     * Real-time triggers
     */
    triggerPriceDropAlert: async (listingId, oldPrice, newPrice) => {
        // Find all users who have this in their wishlist
        const wishlists = await Wishlist.find({ 'items.itemId': listingId });
        
        const listing = await Listing.findById(listingId);
        if (!listing) return;

        for (const wishlist of wishlists) {
            const user = await Host.findById(wishlist.userId);
            if (user) {
                await sendAppEmail({
                    to: user.email,
                    type: EMAIL_TYPES.WISHLIST_PRICE_DROP,
                    payload: {
                        userName: user.userName,
                        trip: listing,
                        data: { oldPrice, newPrice }
                    }
                });

                await EmailLog.create({
                    userId: wishlist.userId,
                    emailType: 'realtime_price',
                    tripIds: [listingId]
                });
            }
            
            // Also log the event for digest scoring
            await WishlistEvent.create({
                userId: wishlist.userId,
                eventType: 'price_drop',
                itemId: listingId,
                metadata: { oldPrice, newPrice }
            });
        }
    },

    /**
     * Limited availability alert
     */
    triggerAvailabilityAlert: async (listingId, daysLeft) => {
        const wishlists = await Wishlist.find({ 'items.itemId': listingId });
        const listing = await Listing.findById(listingId);
        if (!listing) return;

        for (const wishlist of wishlists) {
            const user = await Host.findById(wishlist.userId);
            if (user) {
                await sendAppEmail({
                    to: user.email,
                    type: EMAIL_TYPES.WISHLIST_AVAILABILITY_LOW,
                    payload: {
                        userName: user.userName,
                        trip: listing,
                        data: { daysLeft }
                    }
                });

                await EmailLog.create({
                    userId: wishlist.userId,
                    emailType: 'realtime_availability',
                    tripIds: [listingId]
                });
            }
        }
    }
};
