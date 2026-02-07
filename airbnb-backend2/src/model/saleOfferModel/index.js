import mongoose from 'mongoose';

const saleOfferSchema = new mongoose.Schema({
    buyerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true,
    },
    sellerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true,
    },
    listingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true,
    },
    offerAmount: {
        type: Number,
        required: true,
    },
    status: {
        type: String, // PENDING, ACCEPTED, REJECTED, NEGOTIATING, SOLD, WITHDRAWN
        enum: ['PENDING', 'ACCEPTED', 'REJECTED', 'NEGOTIATING', 'SOLD', 'WITHDRAWN'],
        default: 'PENDING',
    },
    message: {
        type: String,
    },
    finalSalePrice: {
        type: Number,
    },
    saleDate: {
        type: Date,
    },
    documents: {
        type: [String], // Sale deeds, etc.
    }
}, {
    timestamps: true,
});

export default mongoose.model('SaleOffer', saleOfferSchema);
