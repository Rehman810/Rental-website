import chatService from '../services/chat.service.js';

export const getConversation = async (req, res) => {
  try {
    const { receiverId } = req.params;
    const senderId = req.user.id; // From JWT middleware

    const messages = await chatService.getMessages(senderId, receiverId);
    res.status(200).json({ messages });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, listingId, role } = req.body;
    const senderId = req.user.id;

    const savedMessage = await chatService.sendMessage(senderId, receiverId, message, listingId, role);
    res.status(201).json({ message: 'Sent', data: savedMessage });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
