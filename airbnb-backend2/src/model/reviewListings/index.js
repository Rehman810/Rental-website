import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  hostId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('Review', reviewSchema);
