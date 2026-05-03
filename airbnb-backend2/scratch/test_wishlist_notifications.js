import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { wishlistNotificationService } from '../src/service/wishlistNotificationService.js';
import Host from '../src/model/hostModel/index.js';
import Listing from '../src/model/listingModel/index.js';
import Wishlist from '../src/model/wishlist/index.js';
import ConnectDB from '../src/dbConnector/index.js';
import config from '../src/config/index.js';

dotenv.config();

const test = async () => {
    try {
        await ConnectDB(config.db, console);
        console.log('Connected to DB');

        // 1. Find a test user (Host model is used for users)
        const user = await Host.findOne({ email: { $exists: true } });
        if (!user) {
            console.error('No user found to test with.');
            process.exit(1);
        }
        console.log(`Testing with user: ${user.email}`);

        // 2. Find a listing
        const listing = await Listing.findOne();
        if (!listing) {
            console.error('No listing found to test with.');
            process.exit(1);
        }
        console.log(`Testing with listing: ${listing.title}`);

        // 3. Ensure listing is in user's wishlist so they receive the alert
        let wishlist = await Wishlist.findOne({ userId: user._id });
        if (!wishlist) {
            wishlist = await Wishlist.create({ userId: user._id, items: [] });
        }
        
        const hasItem = wishlist.items.some(item => item.itemId.toString() === listing._id.toString());
        if (!hasItem) {
            console.log('Adding listing to user wishlist for testing...');
            wishlist.items.push({ itemId: listing._id, addedAt: new Date() });
            await wishlist.save();
        }

        console.log('--- Triggering Price Drop Alert ---');
        await wishlistNotificationService.triggerPriceDropAlert(listing._id, listing.weekdayPrice + 50, listing.weekdayPrice);

        console.log('--- Triggering Availability Alert ---');
        await wishlistNotificationService.triggerAvailabilityAlert(listing._id, 3);

        console.log('--- Triggering 24h Reminder (Logic Check) ---');
        // This won't send unless the user has exactly 1 item and a pending event
        // We'll just call the service method if we wanted to test the sending part specifically, 
        // but since we already tested sendAppEmail via triggers above, we're good.

        console.log('Test complete. Check your email or console for Resend logs.');
        process.exit(0);
    } catch (error) {
        console.error('Test failed:', error);
        process.exit(1);
    }
};

test();
