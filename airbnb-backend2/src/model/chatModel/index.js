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
    messages: [
      {
        senderId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
        message: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  });
  
const Chat = mongoose.model('Chat', chatSchema);
export default Chat;
