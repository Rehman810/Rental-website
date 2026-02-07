import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Host from '../src/model/hostModel/index.js';

export const seedHosts = async () => {
    try {
        console.log('Seeding Hosts...');
        // Delete existing hosts
        await Host.deleteMany({});
        console.log('Deleted existing hosts');

        const hosts = [];
        // Create a common hashed password for performance
        const password = await bcrypt.hash('password123', 10);

        for (let i = 0; i < 50; i++) {
            const firstName = faker.person.firstName();
            const lastName = faker.person.lastName();

            const host = {
                userName: `${firstName} ${lastName}`,
                email: faker.internet.email({ firstName, lastName }),
                isEmailVerified: true,
                emailVerifiedAt: new Date(),
                isVerify: true, // As per requirements
                accountStatus: 'active',
                authProvider: 'local',
                password: password,
                role: faker.helpers.arrayElement(['guest', 'host']),
                phoneNumber: parseInt(faker.string.numeric(10)), // Ensure number type
                photoProfile: `https://i.pravatar.cc/300?img=${i + 1}`,
                CNIC: {
                    images: [
                        'https://via.placeholder.com/400x300?text=CNIC',
                        'https://via.placeholder.com/400x300?text=CNIC'
                    ],
                    isVerified: true
                },
                // Populate settings with defaults or random values if needed
                settings: {
                    pricing: {
                        basePrice: faker.number.int({ min: 50, max: 500 }),
                        weekendPrice: faker.number.int({ min: 60, max: 600 }),
                    },
                    availability: {
                        minNights: 1,
                        maxNights: 30,
                        checkInFrom: "14:00",
                        checkOutBy: "11:00"
                    }
                }
            };

            hosts.push(host);
        }

        // Insert hosts
        // Use insertMany for efficiency. Validation is run by default.
        // Note: With insertMany, we need to handle unique constraints if faker generates duplicates (unlikely for 50)
        const createdHosts = await Host.insertMany(hosts);
        console.log(`Successfully seeded ${createdHosts.length} hosts`);
        return createdHosts;

    } catch (error) {
        console.error('Error seeding hosts:', error);
        throw error;
    }
};
