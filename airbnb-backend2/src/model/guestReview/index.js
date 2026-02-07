import mongoose from 'mongoose';

const guestReviewSchema = new mongoose.Schema({
    guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
    hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
    bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfirmedBooking', required: true },
    rating: { type: Number, required: true, min: 1, max: 5 },
    comment: { type: String, required: true },
}, {
    timestamps: true,
});

guestReviewSchema.index({ guestId: 1 });
guestReviewSchema.index({ bookingId: 1 }, { unique: true });

export default mongoose.model('GuestReview', guestReviewSchema);
