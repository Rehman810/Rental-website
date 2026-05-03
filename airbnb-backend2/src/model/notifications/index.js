import mongoose from 'mongoose';

const emailLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host', // Assuming 'Host' is the user model based on wishlist ref
        required: true
    },
    emailType: {
        type: String,
        enum: ['reminder', 'digest', 'realtime_price', 'realtime_availability'],
        required: true
    },
    tripIds: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing'
    }],
    sentAt: {
        type: Date,
        default: Date.now
    },
    status: {
        type: String,
        enum: ['sent', 'failed'],
        default: 'sent'
    },
    engagement: {
        views: { type: Number, default: 0 },
        clicks: { type: Number, default: 0 }
    }
}, { timestamps: true });

// Index for 48h window check
emailLogSchema.index({ userId: 1, sentAt: -1 });

export const EmailLog = mongoose.model('EmailLog', emailLogSchema);

const wishlistEventSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true
    },
    eventType: {
        type: String,
        enum: ['added', 'price_drop', 'viewed', 'clicked'],
        required: true
    },
    itemId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Listing',
        required: true
    },
    metadata: {
        oldPrice: Number,
        newPrice: Number,
        timestamp: { type: Date, default: Date.now }
    }
}, { timestamps: true });

export const WishlistEvent = mongoose.model('WishlistEvent', wishlistEventSchema);
