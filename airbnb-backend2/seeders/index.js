
import mongoose from 'mongoose';
import dbConnector from '../src/dbConnector/index.js';
import config from '../src/config/index.js';
import { seedHosts } from './host.seeder.js';
import { seedListings } from './listing.seeder.js';
import { seedBookings } from './booking.seeder.js';
import { seedReviews } from './review.seeder.js';
import seedPolicies from '../src/controller/cancellationPolicy/seedPolicies.js';

const runSeeders = async () => {
    console.log('🚀 Starting Database Seeder...');

    try {
        // Connect to Database
        await dbConnector(config.db, console);

        // Seed Policies
        await seedPolicies();

        // 1. Seed Hosts (Users)
        const hosts = await seedHosts();

        // 2. Seed Listings (assigned to random hosts)
        // passing IDs only, as expected by the seeder logic I wrote
        const listings = await seedListings(hosts.map(host => host._id));

        // 3. Seed Bookings (past bookings for reviews)
        // passing full host objects because booking seeder might need roles or just IDs (checked: it maps to strings, so objects are fine)
        const bookings = await seedBookings(hosts, listings);

        // 4. Seed Reviews (linked to bookings)
        await seedReviews(bookings, listings);

        console.log('✨ All seeders executed successfully!');
        process.exit(0);

    } catch (error) {
        console.error('❌ Seeding failed with error:');
        console.error(error);
        process.exit(1);
    }
};

runSeeders();
