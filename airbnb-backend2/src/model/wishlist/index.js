import mongoose from 'mongoose';

const wishlistSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Host',
        required: true,
        unique: true
    },
    items: [
        {
            itemId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'Listing',
                required: true
            },
            type: {
                type: String,
                required: true,
                default: 'property'
            },
            addedAt: {
                type: Date,
                default: Date.now
            }
        }
    ]
}, {
    timestamps: true
});

export default mongoose.model('Wishlist', wishlistSchema);
