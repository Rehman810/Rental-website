import chatRepository from '../repositories/chat.repository.js';
import notificationService from './notification.service.js';
import { emitToUser } from '../socket/socket.gateway.js';
import { Listing, User } from '../models/external.models.js';
import { generateAiReply } from './ai/aiProvider.js';
import { buildHostAssistantPrompt } from './ai/promptBuilder.js';
import { generateListingSummary } from './ai/summaryGenerator.js';

class ChatService {
  async sendMessage(senderId, receiverId, message, listingId, role) {
    let conversation = await chatRepository.findConversation(senderId, receiverId);
    
    if (!conversation) {
      conversation = await chatRepository.createConversation(senderId, receiverId, listingId);
    }

    const newMessage = {
      senderId,
      receiverId,
      message,
      role: role || 'guest',
      timestamp: new Date()
    };

    const updatedChat = await chatRepository.addMessage(conversation._id, newMessage);
    const savedMessage = updatedChat.messages[updatedChat.messages.length - 1];

    // 1. Emit to Receiver via Socket
    emitToUser(receiverId, 'receive_message', savedMessage);
    
    // 2. Emit to Sender (for sync across multiple devices)
    emitToUser(senderId, 'receive_message', savedMessage);

    // 3. Trigger Notification
    const sender = await User.findById(senderId);
    const senderName = sender?.firstName || sender?.userName || 'Someone';

    await notificationService.notify({
      userId: receiverId,
      type: 'NEW_MESSAGE',
      title: 'New Message',
      message: `You have a new message from ${senderName}`,
      data: { conversationId: conversation._id },
      channels: ['DB', 'SOCKET', 'PUSH']
    });

    // 4. AI Response Flow (ASYNC)
    if (role === 'guest' && listingId) {
        this.processAiResponse(conversation._id, senderId, receiverId, message, listingId);
    }

    return savedMessage;
  }

  async processAiResponse(conversationId, guestId, hostId, message, listingId) {
    // Delay to feel natural
    setTimeout(async () => {
        try {
            const listing = await Listing.findById(listingId);
            if (!listing) return;

            const host = await User.findById(listing.hostId);
            const isAiEnabled = host?.settings?.aiAssistant?.enabled;

            if (listing.autoReplyEnabled || isAiEnabled) {
                const conversation = await chatRepository.getUserConversations(guestId); // Simplified lookup
                const chat = await chatRepository.findConversation(guestId, hostId);
                
                // Limit history to last 5 messages
                const chatHistory = chat.messages.slice(-5).map(m => ({
                    role: m.role === 'assistant' || m.isAI ? 'assistant' : 'user',
                    message: m.message
                }));

                const prompt = buildHostAssistantPrompt(listing, chatHistory, message);
                const hostApiKey = host?.settings?.aiAssistant?.geminiApiKey;
                const aiReplyText = await generateAiReply(prompt, hostApiKey);

                if (aiReplyText) {
                    const aiMessage = {
                        senderId: hostId, // Acting for host
                        receiverId: guestId,
                        message: aiReplyText.trim(),
                        role: 'assistant',
                        isAI: true,
                        timestamp: new Date()
                    };

                    const updatedChat = await chatRepository.addMessage(chat._id, aiMessage);
                    const savedAiMessage = updatedChat.messages[updatedChat.messages.length - 1];
                    
                    emitToUser(guestId, 'receive_message', savedAiMessage);
                    emitToUser(hostId, 'receive_message', savedAiMessage);
                }
            }
        } catch (error) {
            console.error('AI Processing Error in New Service:', error);
        }
    }, 2000);
  }

  async getMessages(user1, user2) {
    const conversation = await chatRepository.findConversation(user1, user2);
    return conversation ? conversation.messages : [];
  }
}

export default new ChatService();
