import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'ConfirmedBooking', required: true },
  guestId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
  ratings: {
    cleanliness: { type: Number, required: true, min: 1, max: 5 },
    location: { type: Number, required: true, min: 1, max: 5 },
    communication: { type: Number, required: true, min: 1, max: 5 },
    value: { type: Number, required: true, min: 1, max: 5 },
  },
  overallRating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true, minlength: 10 },
  photos: { type: [String], default: [] },
  hostResponse: {
    message: { type: String },
    respondedAt: { type: Date },
  },
  isVerified: { type: Boolean, default: true },
}, {
  timestamps: true,
});

reviewSchema.index({ listingId: 1 });
reviewSchema.index({ guestId: 1 });
reviewSchema.index({ bookingId: 1, guestId: 1 }, { unique: true });

export default mongoose.model('Review', reviewSchema);
