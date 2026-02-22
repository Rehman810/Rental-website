import mongoose from 'mongoose';

const legalAuditLogSchema = new mongoose.Schema({
    action: {
        type: String,
        required: true, // e.g., 'AGREEMENT_SIGNED', 'VERIFICATION_COMPLETED', 'AGREEMENT_DOWNLOADED'
    },
    entityId: {
        type: mongoose.Schema.Types.ObjectId, // ID of the Agreement or Verification
        required: true,
    },
    entityType: {
        type: String,
        enum: ['LongTermAgreement', 'IdentityVerification'],
        required: true,
    },
    actorId: {
        type: mongoose.Schema.Types.ObjectId, // User who performed the action
        ref: 'User',
    },
    ipAddress: String,
    userAgent: String,
    details: mongoose.Schema.Types.Mixed,
    timestamp: {
        type: Date,
        default: Date.now,
    },
}, {
    timestamps: true,
});

export default mongoose.model('LegalAuditLog', legalAuditLogSchema);
