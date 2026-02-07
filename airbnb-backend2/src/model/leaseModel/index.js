import mongoose from 'mongoose';

const leaseSchema = new mongoose.Schema({
    tenantId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true,
    },
    hostId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true,
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    startDate: {
        type: Date,
        required: true,
    },
    endDate: {
        type: Date,
        required: true,
    },
    monthlyRent: {
        type: Number,
        required: true,
    },
    securityDeposit: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['PENDING', 'ACTIVE', 'REJECTED', 'ENDED', 'RENEWAL_REQUESTED', 'CANCELLED'],
        default: 'PENDING',
    },
    renewalEligible: {
        type: Boolean,
        default: false,
    },
    documents: {
        type: [String], // URLs to signed lease, etc.
        default: [],
    },
    paymentHistory: [{
        paymentDate: Date,
        amount: Number,
        status: { type: String, enum: ['PAID', 'PENDING', 'FAILED'] },
        month: String, // e.g. "2023-10"
    }]
}, {
    timestamps: true
});

export default mongoose.model('Lease', leaseSchema);
