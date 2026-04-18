import mongoose from 'mongoose';

const chatSchema = new mongoose.Schema({
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  guestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  listingId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Listing',
    required: false,
  },
  messages: [
    {
      senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
      receiverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      message: { type: String, required: true },
      role: { type: String, enum: ['guest', 'host', 'assistant'] },
      isAI: { type: Boolean, default: false },
      timestamp: { type: Date, default: Date.now },
    },
  ],
}, { timestamps: true });

export const Chat = mongoose.model('Chat', chatSchema);
