import mongoose from 'mongoose';

const cancellationPolicySchema = new mongoose.Schema({
    type: {
        type: String,
        enum: ['PREDEFINED', 'CUSTOM'],
        required: true
    },
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    rules: {
        fullRefundHours: { type: Number }, // e.g., 24, 48 hours after booking
        partialRefundBeforeCheckIn: {
            enabled: { type: Boolean, default: false },
            percentage: { type: Number },
            hoursBeforeCheckIn: { type: Number }
        },
        noRefundAfterCheckIn: { type: Boolean, default: true }
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        default: null
    },
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

export default mongoose.model('CancellationPolicy', cancellationPolicySchema);
