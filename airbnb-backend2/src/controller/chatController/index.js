import Chat from '../../model/chatModel/index.js';
import User from '../../model/hostModel/index.js';
import Listing from '../../model/listingModel/index.js';
import { createNotification, NOTIFICATION_TYPES } from '../../config/notifications/notificationService.js';
import { generateAiReply } from '../../service/ai/aiProvider.js';
import { buildHostAssistantPrompt } from '../../service/ai/promptBuilder.js';

import { generateListingSummary } from '../../service/ai/summaryGenerator.js';
export const chatController = {
  sendMessage: async (io, req, res) => {
    const { guestId, message, listingId, role } = req.body;
    const hostId = req.user._id;
    if (!guestId || !hostId || !message) {
      return res.status(400).json({ message: 'Both hostId and guestId are required, along with the message.' });
    }

    try {
      const [user1, user2] = [hostId, guestId].sort();
      let chat = await Chat.findOne({ hostId: user1, guestId: user2 });
      if (!chat) {
        chat = new Chat({ hostId: user1, guestId: user2, messages: [] });
      }

      const senderRole = role || 'guest';
      if (listingId) chat.listingId = listingId;

      const newMessage = {
        senderId: hostId,
        receiverId: guestId,
        message,
        role: senderRole,
        isAI: false,
        timestamp: new Date()
      };
      chat.messages.push(newMessage);
      await chat.save();

      // Retrieve the saved message with its _id
      const savedMessage = chat.messages[chat.messages.length - 1];

      const chatRoomId = `${user1}_${user2}`;

      // Emit 'receive_message' to match frontend listener
      io.to(chatRoomId).emit('receive_message', savedMessage);

      // Notification
      await createNotification({
        userId: guestId,
        type: NOTIFICATION_TYPES.NEW_MESSAGE,
        title: 'New Message',
        message: 'You have received a new message.',
        role: 'guest',
        data: { actionUrl: '/user/guestAllMessages' }
      });
      res.status(201).json({ message: 'Message sent successfully.', chat });

      // AI Response Flow (ASYNC - do not block API)
      if (senderRole === 'guest' && chat.listingId) setTimeout(async () => {
        try {
          const listing = await Listing.findById(chat.listingId);
          if (!listing) return;

          const host = await User.findById(listing.hostId).select('+settings.aiAssistant.geminiApiKey');
          const isAiEnabled = host?.settings?.aiAssistant?.enabled && host?.settings?.aiAssistant?.geminiApiKey;

          if (listing.autoReplyEnabled || isAiEnabled) {
            // Simple Rate Limiting: Prevent more than 1 AI message per 3 seconds per listing
            const now = Date.now();
            const lastAiMessage = chat.messages.filter(m => m.isAI).pop();
            if (lastAiMessage && (now - new Date(lastAiMessage.timestamp).getTime() < 3000)) {
              console.log("[AI Rate Limit] Skipping reply for listing:", listing._id);
              return;
            }

            // Auto-generate summary once if missing
            if (!listing.aiSummary) {
              const summary = await generateListingSummary(listing);
              if (summary) {
                listing.aiSummary = summary;
                await listing.save();
              }
            }

            // Limit history to last 5 messages as requested
            const chatHistory = chat.messages.slice(-5).map(m => ({
              role: m.role === 'assistant' || m.isAI ? 'assistant' : 'user',
              message: m.message
            }));

            const prompt = buildHostAssistantPrompt(listing, chatHistory, message);
            const hostApiKey = host?.settings?.aiAssistant?.geminiApiKey;
            let aiReplyText = await generateAiReply(prompt, hostApiKey);

            if (aiReplyText) {
              // The AI is already instructed to use the escalation phrase if needed.
              // However, we can keep a safety check if we want, but the prompt is quite strict now.
              
              const aiMessage = {
                senderId: guestId, // assistant acting for host
                receiverId: hostId, // guest receiving
                message: aiReplyText.trim(),
                role: 'assistant',
                isAI: true,
                timestamp: new Date()
              };

              chat.messages.push(aiMessage);
              await chat.save();

              const savedAiMessage = chat.messages[chat.messages.length - 1];
              io.to(chatRoomId).emit('receive_message', savedAiMessage);
            }

          }
        } catch (aiError) {
          console.error('AI Processing Error:', aiError);
        }
      }, 1000); // 1s delay to feel natural
    } catch (error) {
      console.error('Error sending message:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
  getChat: async (io, req, res) => {
    const userId = req.params.userId;
    const currentUserId = req.user._id;

    try {
      const [user1, user2] = [currentUserId, userId].sort();
      const chat = await Chat.findOne({ hostId: user1, guestId: user2 })


      if (!chat) {
        return res.status(404).json({ message: 'No chat found between the specified users.' });
      }

      const chatRoomId = `${user1}_${user2}`;
      io.to(chatRoomId).emit('receive_message', chat);

      res.status(200).json({
        chatId: chat._id,
        host: chat.hostId,
        guest: chat.guestId,
        messages: chat.messages,
      });
    } catch (error) {
      console.error('Error retrieving chat:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },

  listUserMessages: async (io, req, res) => {
    const currentUserId = req.user._id;
    try {
      const chats = await Chat.find({
        $or: [{ hostId: currentUserId }, { guestId: currentUserId }],
      })
        .populate({
          path: 'hostId',
          model: 'Host',
          select: 'userName email photoProfile',
        })
        .populate({
          path: 'guestId',
          model: 'Host',
          select: 'userName email photoProfile',
        });

      if (!chats || chats.length === 0) {
        return res.status(404).json({ message: 'No chats found for this user.' });
      }
      const userList = chats.map(chat => {
        const isCurrentUserHost = String(chat.hostId._id) === String(currentUserId);

        return isCurrentUserHost
          ? {
            id: chat.guestId._id,
            name: chat.guestId.userName,
            email: chat.guestId.email,
            photoProfile: chat.guestId.photoProfile,
            type: 'guest',
          }
          : {
            id: chat.hostId._id,
            name: chat.hostId.userName,
            email: chat.hostId.email,
            photoProfile: chat.hostId.photoProfile,
            type: 'host',
          };
      });
      const uniqueUsers = Array.from(
        new Map(userList.map(user => [user.id, user])).values()
      );
      const response = {
        currentUserId,
        users: uniqueUsers,
      };
      io.emit('user_list', response);

      res.status(200).json(response);
    } catch (error) {
      console.error('Error listing user interactions:', error.message);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  },


};
