import cron from 'node-cron';
import { wishlistNotificationService } from '../service/wishlistNotificationService.js';

// Run every hour to check for 24h reminders
cron.schedule('0 * * * *', async () => {
    console.log('Running 24h Wishlist Reminder Cron...');
    try {
        await wishlistNotificationService.processReminders();
    } catch (error) {
        console.error('Error in 24h Wishlist Reminder Cron:', error);
    }
});

// Run every Monday at 9 AM for weekly digest
cron.schedule('0 9 * * 1', async () => {
    console.log('Running Weekly Wishlist Digest Cron...');
    try {
        await wishlistNotificationService.processWeeklyDigests();
    } catch (error) {
        console.error('Error in Weekly Wishlist Digest Cron:', error);
    }
});
