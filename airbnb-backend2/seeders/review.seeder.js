
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Review from '../src/model/reviewListings/index.js';

const POSITIVE_COMMENTS = [
    "Amazing place! The host was incredibly welcoming and the location was perfect.",
    "Highly recommended. Clean, spacious, and very comfortable.",
    "Had a wonderful stay. Everything was as described. Would definitely come back!",
    "Great value for money. The apartment was spotless and had all the amenities we needed.",
    "Beautiful home in a great neighborhood. The host was very responsive and helpful.",
    "One of the best platform experiences I've had. The attention to detail was impressive.",
    "Lovely place! Very cozy and felt just like home.",
    "Fantastic location, close to everything. The host provided great local tips.",
    "Super clean and modern. Bed was very comfortable.",
    "Excellent stay. Check-in was smooth and the place was exactly like the photos."
];

const MIXED_COMMENTS = [
    "Good place overall, but could use some minor improvements.",
    "Nice location, but the wifi was a bit spotty.",
    "Decent stay for the price. Location is a bit noisy though.",
    "The apartment is nice, but smaller than it looks in photos.",
    "Host was great, but the cleanliness could be better.",
    "Okay stay. Good location but the AC wasn't working perfectly."
];

export const seedReviews = async (bookings, listings) => {
    console.log('🌱 Seeding Reviews...');
    await Review.deleteMany({});
    console.log('   Cleared existing reviews');

    const reviews = [];
    const listingMap = new Map();
    listings.forEach(l => listingMap.set(l._id.toString(), l));

    for (const booking of bookings) {
        const listingIdStr = booking.listingId.toString();
        const listing = listingMap.get(listingIdStr);

        if (!listing) continue;

        // Determine if review is positive or mixed (mostly positive)
        const isPositive = Math.random() > 0.15; // 85% positive
        const comment = isPositive
            ? faker.helpers.arrayElement(POSITIVE_COMMENTS)
            : faker.helpers.arrayElement(MIXED_COMMENTS);

        const baseRating = isPositive ? 5 : 3;
        const ratingVariance = () => Math.floor(Math.random() * 2); // 0 or 1

        reviews.push({
            listingId: booking.listingId,
            bookingId: booking._id,
            guestId: booking.userId, // The guest who booked
            hostId: listing.hostId,  // The host of the listing
            ratings: {
                cleanliness: Math.min(5, Math.max(1, baseRating - ratingVariance())),
                location: Math.min(5, Math.max(1, baseRating - ratingVariance())),
                communication: Math.min(5, Math.max(1, baseRating - ratingVariance())),
                value: Math.min(5, Math.max(1, baseRating - ratingVariance())),
            },
            overallRating: Math.min(5, Math.max(1, baseRating - ratingVariance())),
            comment: comment,
            isVerified: true,
            createdAt: faker.date.soon({ days: 30, refDate: booking.endDate }) // Review after stay
        });
    }

    const createdReviews = await Review.insertMany(reviews);
    console.log(`✅ Seeded ${createdReviews.length} reviews`);
    return createdReviews;
};
