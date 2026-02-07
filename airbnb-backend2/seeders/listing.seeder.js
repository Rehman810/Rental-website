
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import Listing from '../src/model/listingModel/index.js';
import CancellationPolicy from '../src/model/cancellationPolicy/index.js';

const CITIES = {
    Karachi: {
        lat: 24.8607,
        lng: 67.0011,
        areas: ['DHA', 'Clifton', 'PECHS', 'Gulshan-e-Iqbal', 'Bahadurabad', 'North Nazimabad'],
        offset: 0.08
    },
    Lahore: {
        lat: 31.5204,
        lng: 74.3587,
        areas: ['DHA', 'Gulberg', 'Model Town', 'Johar Town', 'Garden Town', 'Cantt'],
        offset: 0.06
    },
    Islamabad: {
        lat: 33.6844,
        lng: 73.0479,
        areas: ['F-6', 'F-7', 'G-11', 'E-11', 'DHA', 'Bahria Town'],
        offset: 0.05
    }
};

const HOUSE_IMAGES = [
    'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
    'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800&q=80',
    'https://images.unsplash.com/photo-1600585154526-990dced4db0d?w=800&q=80',
    'https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?w=800&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753376-12c8ab7fb75b?w=800&q=80',
    'https://images.unsplash.com/photo-1600585152220-90363fe7e115?w=800&q=80',
    'https://images.unsplash.com/photo-1600573472550-8090b5e0745e?w=800&q=80'
];

const INTERIOR_IMAGES = [
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80',
    'https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?w=800&q=80',
    'https://images.unsplash.com/photo-1600585152915-d208bec867a1?w=800&q=80',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'https://images.unsplash.com/photo-1560185007-cde436f6a4d0?w=800&q=80',
    'https://images.unsplash.com/photo-1560185893-a55cbc8c57e8?w=800&q=80',
    'https://images.unsplash.com/photo-1560184897-ae75f418493e?w=800&q=80',
    'https://images.unsplash.com/photo-1556912172-45b7abe8b7e1?w=800&q=80',
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?w=800&q=80",
    "https://images.unsplash.com/photo-1600210492493-0946911123ea?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8aW50ZXJpb3J8ZW58MHx8MHx8fDA%3D",
    "https://images.unsplash.com/photo-1615529182904-14819c35db37?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGludGVyaW9yfGVufDB8fDB8fHww",
    "https://plus.unsplash.com/premium_photo-1684508638760-72ad80c0055f?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGludGVyaW9yfGVufDB8fDB8fHww",
    "https://images.unsplash.com/photo-1664711942326-2c3351e215e6?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTl8fGludGVyaW9yfGVufDB8fDB8fHww",
    "https://plus.unsplash.com/premium_photo-1680382578857-c331ead9ed51?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8a2l0Y2hlbnxlbnwwfHwwfHx8MA%3D%3D",
    "https://images.unsplash.com/photo-1631889993959-41b4e9c6e3c5?w=500&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmF0aHJvb218ZW58MHx8MHx8fDA%3D"

];

const TITLES = {
    Karachi: ["Sea View Apartment", "Luxury DHA Villa", "Cozy Clifton Flat", "Modern PECHS House", "Spacious Gulshan Home"],
    Lahore: ["Traditional Haveli", "Modern Gulberg Studio", "DHA Family Home", "Johar Town Residence", "Model Town Villa"],
    Islamabad: ["Margalla View Apartment", "F-6 Designer Home", "G-11 Cozy Corner", "E-11 Luxury Suite", "DHA Modern House"]
};

export const seedListings = async (hostIds) => {
    console.log('🌱 Seeding Listings...');
    await Listing.deleteMany({});
    console.log('   Cleared existing listings');

    if (!hostIds || hostIds.length === 0) {
        throw new Error('No hosts provided for listings!');
    }

    // Fetch policies
    const policies = await CancellationPolicy.find({});
    const policyIds = policies.map(p => p._id);

    const listings = [];

    for (const hostId of hostIds) {
        const numListings = faker.number.int({ min: 3, max: 5 });

        for (let j = 0; j < numListings; j++) {
            const cityKey = faker.helpers.arrayElement(Object.keys(CITIES));
            const cityData = CITIES[cityKey];

            const area = faker.helpers.arrayElement(cityData.areas);
            const titleBase = faker.helpers.arrayElement(TITLES[cityKey]);

            // Coordinate logic
            const latOffset = (Math.random() - 0.5) * cityData.offset;
            const lngOffset = (Math.random() - 0.5) * cityData.offset;
            const latitude = cityData.lat + latOffset;
            const longitude = cityData.lng + lngOffset;

            const coverPhoto = faker.helpers.arrayElement(HOUSE_IMAGES);
            const otherPhotos = faker.helpers.arrayElements(INTERIOR_IMAGES, faker.number.int({ min: 3, max: 5 }));

            const weekdayPrice = faker.number.int({ min: 6, max: 25 }) * 1000;
            const weekendPrice = faker.number.int({ min: 8, max: 35 }) * 1000;

            const createdAt = faker.date.past({ years: 1 });

            const listing = {
                hostId,
                title: `${titleBase} in ${area}`,
                description: `Experience the best of ${cityKey} in this beautiful ${area} home. ${faker.lorem.paragraph()}`,
                placeType: faker.helpers.arrayElement(['House', 'Apartment']),
                roomType: 'Entire Place',
                bookingMode: faker.helpers.arrayElement(['instant', 'request']),

                street: `${faker.number.int({ min: 1, max: 100 })}, Street ${faker.number.int({ min: 1, max: 20 })}, ${area}`,
                city: cityKey,
                town: area,
                postcode: faker.location.zipCode(),
                latitude,
                longitude,
                location: {
                    type: 'Point',
                    coordinates: [longitude, latitude] // Note: GeoJSON is [lng, lat]
                },

                guestCapacity: faker.number.int({ min: 2, max: 8 }),
                beds: faker.number.int({ min: 1, max: 4 }),
                bathrooms: faker.number.int({ min: 1, max: 3 }),
                bedrooms: faker.number.int({ min: 1, max: 4 }),
                amenities: ['Wifi', 'Kitchen', 'AC', 'Heater', 'Washer', 'Free parking'],
                photos: [coverPhoto, ...otherPhotos],

                weekdayPrice,
                weekendPrice,
                weekdayActualPrice: Math.round(weekdayPrice * 1.13),
                weekendActualPrice: Math.round(weekendPrice * 1.13),

                ratingAvg: faker.number.float({ min: 3.5, max: 5, multipleOf: 0.1 }),
                ratingCount: faker.number.int({ min: 0, max: 50 }),
                cancellationPolicy: policyIds.length > 0 ? faker.helpers.arrayElement(policyIds) : null,

                createdAt,
                updatedAt: createdAt
            };

            listings.push(listing);
        }
    }

    const createdListings = await Listing.insertMany(listings);
    console.log(`✅ Seeded ${createdListings.length} listings`);
    return createdListings;
};
