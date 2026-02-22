import mongoose from 'mongoose';

const identityVerificationSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User', // Could be Host or User (Tenant)
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'verified', 'rejected'],
        default: 'pending',
    },
    cnicFrontUrl: {
        type: String,
        required: true,
    },
    cnicBackUrl: {
        type: String,
        required: true,
    },
    selfieUrl: {
        type: String,
        required: true,
    },
    // Biometric Data
    fingerprintImages: [{
        type: String, // URLs of captured raw frames
    }],
    fingerprintTemplate: {
        type: String, // Processed hash/template
    },
    biometricMetadata: {
        ipAddress: String,
        userAgent: String,
        deviceInfo: String,
        capturedAt: Date,
    },

    // Verification Metrics
    faceMatchScore: {
        type: Number, // 0 to 100
    },
    livenessScore: {
        type: Number, // 0 to 100
    },

    // Compliance
    verificationType: {
        type: String,
        default: 'Camera-Based Biometric Verification',
    },
    consentGiven: {
        type: Boolean,
        required: true,
        default: false
    },
    consentTimestamp: {
        type: Date,
        default: Date.now
    },

    rejectionReason: {
        type: String,
    },
    verifiedAt: {
        type: Date,
    },
}, {
    timestamps: true,
});

export default mongoose.model('IdentityVerification', identityVerificationSchema);
