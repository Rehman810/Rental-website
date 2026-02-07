import { faker } from '@faker-js/faker';
import Listing from '../src/model/listingModel/index.js';
import Host from '../src/model/hostModel/index.js';

export const seedListings = async (hosts) => {
    try {
        console.log('Seeding Listings...');
        // Delete existing listings
        await Listing.deleteMany({});
        console.log('Deleted existing listings');

        const listings = [];
        const placeTypes = [
            'House', 'Apartment', 'Shared Room', 'Bed & breakfast', 'Boat',
            'Cabin', 'Campervan/motorhome', 'Casa particular', 'Castle'
        ];
        const roomTypes = ['Entire Place', 'A Room', 'A Shared Room'];
        const bookingModes = ['instant', 'request'];

        if (!hosts || hosts.length === 0) {
            console.warn('No hosts provided, fetching from DB...');
            hosts = await Host.find({});
        }

        if (hosts.length === 0) {
            console.error('No hosts found to attach listings to.');
            return;
        }

        for (const host of hosts) {
            // Create at least 3 listings per host
            const numListings = faker.number.int({ min: 3, max: 5 });

            for (let j = 0; j < numListings; j++) {
                const lat = faker.location.latitude();
                const lng = faker.location.longitude();

                const listing = {
                    hostId: host._id,
                    title: faker.lorem.sentence({ min: 3, max: 8 }),
                    description: faker.lorem.paragraph(),
                    photos: [
                        `https://loremflickr.com/640/480/house?random=${Math.random()}`,
                        `https://loremflickr.com/640/480/apartment?random=${Math.random()}`,
                        `https://loremflickr.com/640/480/room?random=${Math.random()}`
                    ],
                    placeType: faker.helpers.arrayElement(placeTypes),
                    roomType: faker.helpers.arrayElement(roomTypes),
                    bookingMode: faker.helpers.arrayElement(bookingModes),
                    amenities: faker.helpers.arrayElements(['WiFi', 'TV', 'Kitchen', 'Air Conditioning', 'Pool', 'Gym'], { min: 2, max: 5 }),

                    // Location
                    latitude: lat,
                    longitude: lng,
                    location: {
                        type: 'Point',
                        coordinates: [lng, lat]
                    },
                    street: faker.location.streetAddress(),
                    city: faker.location.city(),
                    postcode: faker.location.zipCode(),

                    guestCapacity: faker.number.int({ min: 1, max: 10 }),
                    beds: faker.number.int({ min: 1, max: 6 }),
                    bathrooms: faker.number.int({ min: 1, max: 4 }),
                    bedrooms: faker.number.int({ min: 1, max: 5 }),

                    weekdayPrice: faker.number.int({ min: 50, max: 500 }),
                    weekendPrice: faker.number.int({ min: 70, max: 600 }),

                    minNights: 1,
                    maxNights: 30
                };

                listings.push(listing);
            }
        }

        const createdListings = await Listing.insertMany(listings);
        console.log(`Successfully seeded ${createdListings.length} listings`);
        return createdListings;

    } catch (error) {
        console.error('Error seeding listings:', error);
        throw error;
    }
};
