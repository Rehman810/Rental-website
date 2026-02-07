
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Booking from '../src/model/confirmBooking/index.js';

export const seedBookings = async (hosts, listings) => {
    console.log('🌱 Seeding Bookings...');
    await Booking.deleteMany({});
    console.log('   Cleared existing bookings');

    const bookings = [];
    const hostIds = hosts.map(h => h._id.toString());

    for (const listing of listings) {
        // Each listing must have some bookings (2-12 per requirements for reviews)
        const numBookings = faker.number.int({ min: 2, max: 12 });

        // Create bookings in the past year
        for (let i = 0; i < numBookings; i++) {
            const startDate = faker.date.past({ years: 1 });
            const nights = faker.number.int({ min: 2, max: 7 });
            const endDate = new Date(startDate);
            endDate.setDate(startDate.getDate() + nights);

            // Ensure guest is NOT the host
            const eligibleGuests = hostIds.filter(id => id !== listing.hostId.toString());
            const guestId = faker.helpers.arrayElement(eligibleGuests);

            // Calculate price (approximate)
            const pricePerNight = listing.weekdayActualPrice || 10000;
            const totalPrice = pricePerNight * nights;

            bookings.push({
                userId: guestId, // Guest
                listingId: listing._id,
                startDate,
                endDate,
                guestCapacity: faker.number.int({ min: 1, max: listing.guestCapacity || 4 }),
                totalPrice,
                status: 'COMPLETED',
                paymentIntentId: `pi_${faker.string.alphanumeric(20)}`,
                reminderSent: true,
                createdAt: faker.date.recent({ days: 30, refDate: startDate }) // Created slightly before start
            });
        }
    }

    const createdBookings = await Booking.insertMany(bookings);
    console.log(`✅ Seeded ${createdBookings.length} bookings`);
    return createdBookings;
};
