import { Chat } from '../models/chat.model.js';

class ChatRepository {
  async findConversation(user1, user2) {
    const sortedUsers = [user1, user2].sort();
    return Chat.findOne({ hostId: sortedUsers[0], guestId: sortedUsers[1] });
  }

  async createConversation(user1, user2, listingId = null) {
    const sortedUsers = [user1, user2].sort();
    const chat = new Chat({
      hostId: sortedUsers[0],
      guestId: sortedUsers[1],
      listingId,
      messages: []
    });
    return chat.save();
  }

  async addMessage(chatId, messageData) {
    return Chat.findByIdAndUpdate(
      chatId,
      { $push: { messages: messageData } },
      { new: true }
    );
  }

  async getUserConversations(userId) {
    return Chat.find({
      $or: [{ hostId: userId }, { guestId: userId }]
    }).sort({ updatedAt: -1 });
  }
}

export default new ChatRepository();
