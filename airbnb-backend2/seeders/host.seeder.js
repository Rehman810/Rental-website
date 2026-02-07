
import mongoose from 'mongoose';
import { faker } from '@faker-js/faker';
import bcrypt from 'bcrypt';
import Host from '../src/model/hostModel/index.js';

const SALT_ROUNDS = 10;
const TOTAL_USERS = 50;
const PAKISTANI_NAMES = [
    "Ali", "Ahmed", "Bilal", "Hamza", "Usman", "Ayesha", "Fatima", "Zainab", "Hina", "Sana",
    "Omar", "Hassan", "Hussain", "Yusuf", "Ibrahim", "Maryam", "Khadija", "Amna", "Sara", "Zara",
    "Abdullah", "Muhammad", "Mustafa", "Raza", "Shahid", "Noreen", "Samina", "Nida", "Rabia", "Uzma",
    "Kamran", "Adnan", "Fahad", "Saad", "Waqas", "Sadia", "Nazia", "Farheen", "Anum", "Mahnoor",
    "Tariq", "Javed", "Saeed", "Nasir", "Imran", "Bushra", "Saira", "Asma", "Saba", "Mehwish"
];

export const seedHosts = async () => {
    console.log('🌱 Seeding Hosts...');

    // Clean existing data
    await Host.deleteMany({});
    console.log('   Cleared existing hosts');

    const users = [];
    const passwordHash = await bcrypt.hash('password123', SALT_ROUNDS);

    const predefinedAvatars = [
        'https://images.unsplash.com/photo-1599566150163-29194dcaad36?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1527980965255-d3b416303d12?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1633332755192-727a05c4013d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1628157588553-5eeea00af15c?w=400&h=400&fit=crop',
        'https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=400&h=400&fit=crop',
    ];

    for (let i = 0; i < TOTAL_USERS; i++) {
        const firstName = faker.helpers.arrayElement(PAKISTANI_NAMES);
        const lastName = faker.person.lastName();
        const fullName = `${firstName} ${lastName}`;

        users.push({
            userName: fullName,
            email: faker.internet.email({ firstName, lastName }).toLowerCase(),
            isEmailVerified: true,
            emailVerifiedAt: faker.date.past(),
            password: passwordHash,
            accountStatus: 'active',
            role: faker.helpers.arrayElement(['guest', 'host']), // Mixed roles, but all can technically host due to app logic
            photoProfile: faker.helpers.arrayElement(predefinedAvatars),
            isVerify: true,
            authProvider: 'local',
            CNIC: {
                images: [faker.image.url(), faker.image.url()],
                isVerified: true
            },
            walletBalance: faker.number.int({ min: 0, max: 50000 }),
            settings: {
                notifications: { email: true, sms: true },
                pricing: { basePrice: 0, weekendPrice: 0 }
            }
        });
    }

    // Ensure unique emails just in case
    const uniqueUsers = Array.from(new Map(users.map(item => [item.email, item])).values());

    if (uniqueUsers.length < TOTAL_USERS) {
        console.warn(`   Generated ${users.length - uniqueUsers.length} duplicate emails. Seeding ${uniqueUsers.length} users.`);
    }

    const createdUsers = await Host.insertMany(uniqueUsers);
    console.log(`✅ Seeded ${createdUsers.length} hosts`);
    return createdUsers; // Return mapping of IDs if needed, or just IDs
};
