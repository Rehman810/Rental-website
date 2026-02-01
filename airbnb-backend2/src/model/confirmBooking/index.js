import mongoose from 'mongoose';

const confirmedBookingSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
  listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  guestCapacity: { type: Number, required: true },
  totalPrice: { type: Number, required: true },
  createdAt: { type: Date, default: Date.now },
  paymentIntentId: { type: String },
  reminderSent: { type: Boolean, default: false },

  // Policy Snapshot
  cancellationPolicy: {
    name: { type: String },
    rules: {
      fullRefundHours: { type: Number },
      partialRefundBeforeCheckIn: {
        enabled: { type: Boolean },
        percentage: { type: Number },
        hoursBeforeCheckIn: { type: Number }
      },
      noRefundAfterCheckIn: { type: Boolean }
    }
  },

  status: {
    type: String,
    enum: ['CONFIRMED', 'CANCELLED', 'COMPLETED'],
    default: 'CONFIRMED'
  },
  cancelledBy: {
    type: String,
    enum: ['GUEST', 'HOST', null],
    default: null
  },
  refundAmount: { type: Number, default: 0 },
  checkIn: { type: Date } // Redundant but useful for policy logic, can populate from startDate on create
});

export default mongoose.model('ConfirmedBooking', confirmedBookingSchema);
