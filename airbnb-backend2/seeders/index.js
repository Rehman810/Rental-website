import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { seedHosts } from './host.seeder.js';
import { seedListings } from './listing.seeder.js';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Use existing URI or default to local
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/airbnb';

const runSeeders = async () => {
    try {
        console.log('Connecting to MongoDB...');
        await mongoose.connect(MONGO_URI);
        console.log('Connected to MongoDB');

        // 1. Seed Hosts
        // This will delete existing hosts first
        const hosts = await seedHosts();

        // 2. Seed Listings
        // Pass created hosts to attach listings
        // This will delete existing listings first
        await seedListings(hosts);

        console.log('All seeders completed successfully.');
        process.exit(0);
    } catch (error) {
        console.error('Seeder failed:', error);
        process.exit(1);
    }
};

runSeeders();
