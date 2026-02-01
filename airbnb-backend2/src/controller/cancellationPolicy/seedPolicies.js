import CancellationPolicy from '../../model/cancellationPolicy/index.js';

const seedPolicies = async () => {
    try {
        const predefined = [
            {
                type: 'PREDEFINED',
                name: 'Flexible',
                description: 'Full refund within 24 hours after booking. Full refund if cancelled before check-in. No refund after check-in.',
                rules: {
                    fullRefundHours: 24, // Refund allowed within 24h of booking
                    partialRefundBeforeCheckIn: {
                        enabled: false,
                    },
                    noRefundAfterCheckIn: true
                }
            },
            {
                type: 'PREDEFINED',
                name: 'Moderate',
                description: 'Full refund within 48 hours after booking. 50% refund up to 24 hours before check-in.',
                rules: {
                    fullRefundHours: 48,
                    partialRefundBeforeCheckIn: {
                        enabled: true,
                        percentage: 50,
                        hoursBeforeCheckIn: 24
                    },
                    noRefundAfterCheckIn: true
                }
            },
            {
                type: 'PREDEFINED',
                name: 'Strict',
                description: 'Full refund within 24 hours after booking. No refund after that. No refund after check-in.',
                rules: {
                    fullRefundHours: 24,
                    partialRefundBeforeCheckIn: {
                        enabled: false
                    },
                    noRefundAfterCheckIn: true
                }
            }
        ];

        for (const policy of predefined) {
            const exists = await CancellationPolicy.findOne({ name: policy.name, type: 'PREDEFINED' });
            if (!exists) {
                await CancellationPolicy.create(policy);
                console.log(`Created predefined policy: ${policy.name}`);
            }
        }
        console.log('Cancellation Policies Seeded.');
    } catch (err) {
        console.error('Error seeding cancellation policies:', err);
    }
};

export default seedPolicies;
