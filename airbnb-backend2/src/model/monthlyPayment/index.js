import mongoose from 'mongoose';

const monthlyPaymentSchema = new mongoose.Schema({
    agreementId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LongTermAgreement',
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
    month: {
        type: Number, // 1-12
        required: true
    },
    year: {
        type: Number,
        required: true
    },
    dueDate: {
        type: Date,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'paid', 'overdue'],
        default: 'pending',
    },
    paidAt: {
        type: Date,
    },
    transactionId: {
        type: String,
    },
    invoiceUrl: {
        type: String,
    },
    lateFee: {
        type: Number,
        default: 0,
    }
}, {
    timestamps: true,
});

export default mongoose.model('MonthlyPayment', monthlyPaymentSchema);
