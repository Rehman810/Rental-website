import mongoose from 'mongoose';

const temporaryBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guestCapacity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  paymentIntentId: { type: String, required: true },
  status: { type: String, enum: ['on_hold', 'pending_approval'], default: 'on_hold' },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model('TemporaryBooking', temporaryBookingSchema);
