import mongoose from 'mongoose';

const NotificationSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
    message: { type: String, required: true }, 
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'Listing', required: false },
    isRead: { type: Boolean, default: false },
    type: { type: String, enum: ['listing', 'cnic', 'other'], required: true },
  },
  { timestamps: true } 
);

const Notification = mongoose.model('Notification', NotificationSchema);
export default Notification;
