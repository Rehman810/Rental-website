import mongoose from 'mongoose';

const adminTransactionSchema = new mongoose.Schema({
    adminId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
    action: {
        type: String,
        enum: ['REFUND', 'CREDIT', 'SUSPEND', 'BAN', 'REACTIVATE'],
        required: true
    },
    amount: { type: Number, default: 0 },
    currency: { type: String, default: 'USD' },
    reason: { type: String, required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'TemporaryBooking' }, // Optional reference
    metadata: { type: Object }, // relevant for storing old state if needed
    createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('AdminTransaction', adminTransactionSchema);
