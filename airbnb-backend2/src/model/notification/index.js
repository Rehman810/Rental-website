import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'Host', required: true },
    role: { type: String, enum: ['guest', 'host', 'admin'], required: false }, // optional but useful
    type: { type: String, required: true }, // e.g., 'AUTH_WELCOME', 'BOOKING_REQUEST', etc.
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: { type: Object, default: {} }, // bookingId, listingId, actionUrl, etc.
    isRead: { type: Boolean, default: false },
    readAt: { type: Date },
  },
  { timestamps: true }
);

// Add indexes for performance
NotificationSchema.index({ userId: 1, isRead: 1 });
NotificationSchema.index({ createdAt: -1 });

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
