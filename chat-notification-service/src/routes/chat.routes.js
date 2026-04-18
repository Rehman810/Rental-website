import express from 'express';
import { getConversation, sendMessage } from '../controllers/chat.controller.js';
import { authenticate } from '../middlewares/auth.middleware.js';

const router = express.Router();

router.get('/:receiverId', authenticate, getConversation);
router.post('/send', authenticate, sendMessage);

export default router;
