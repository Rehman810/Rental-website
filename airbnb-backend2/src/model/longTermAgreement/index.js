import mongoose from 'mongoose';

const longTermAgreementSchema = new mongoose.Schema({
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
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
    // Extended Status Enum for 3-Phase Lease Model
    status: {
        type: String,
        enum: [
            // New Statuses
            "pending",
            "preApproved",
            "documentsRequested",
            "verified",
            "approved",
            "agreementSigned",
            "rejected",

            // Legacy/Existing Statuses (maintained for backward compatibility)
            "draft",
            "pending_verification",
            "ready_to_sign",
            "signed_by_tenant",
            "active", // Shared status
            "completed",
            "terminated",
            "expired"
        ],
        default: 'pending',
    },
    // Application Details
    income: {
        type: Number,
    },
    employer: {
        type: String,
    },
    employmentDuration: { // Months
        type: Number,
    },
    currentAddress: {
        type: String,
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
    paymentDay: {
        type: Number,
        default: 1, // Day of the month rent is due
    },
    terms: {
        type: String, // Stringified JSON or HTML of the agreement
        required: false, // Not required initially in new flow
    },

    // New Control Fields
    riskScore: {
        type: Number,
        default: 0
    },
    verificationCompleted: {
        type: Boolean,
        default: false
    },
    agreementGenerated: {
        type: Boolean,
        default: false
    },
    otpVerified: {
        type: Boolean,
        default: false
    },

    tenantSignature: {
        signedAt: Date,
        ipAddress: String,
        userAgent: String,
        signatureHash: String,
    },
    hostSignature: {
        signedAt: Date,
        ipAddress: String,
        userAgent: String,
        signatureHash: String,
    },
    notarySeal: {
        notarizedAt: Date,
        transactionId: String,
        blockHash: String, // Simulate blockchain
        authoritySignature: String,
    },
    agreementPdfUrl: {
        type: String,
    },
    agreementHash: {
        type: String, // SHA-256 of the final doc
    },
}, {
    timestamps: true,
});

export default mongoose.model('LongTermAgreement', longTermAgreementSchema);
