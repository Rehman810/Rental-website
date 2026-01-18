import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  bookingId: { type: mongoose.Schema.Types.ObjectId, ref: 'TemporaryBooking', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  paymentIntentId: { type: String, required: true },
  paymentStatus: { type: String, enum: ['pending', 'succeeded', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

export default mongoose.model('Payment', paymentSchema);
