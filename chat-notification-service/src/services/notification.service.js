import notificationRepository from '../repositories/notification.repository.js';
import { emitToUser } from '../socket/socket.gateway.js';
import nodemailer from 'nodemailer';
// import admin from 'firebase-admin'; // Initialize this in config

class NotificationService {
  constructor() {
    this.transporter = nodemailer.createTransport({
      // Your email config here
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });
  }

  async notify(payload) {
    const { userId, type, title, message, data, channels = ['SOCKET', 'DB'] } = payload;

    let savedNotification = null;

    // 1. Persist to DB if requested
    if (channels.includes('DB')) {
      savedNotification = await notificationRepository.create({
        userId,
        type,
        title,
        message,
        data,
      });
    }

    // 2. Real-time via Socket
    if (channels.includes('SOCKET')) {
      emitToUser(userId, 'notification:new', savedNotification || payload);
    }

    // 3. Push Notification (FCM)
    if (channels.includes('PUSH')) {
      this.sendPushNotification(userId, title, message, data);
    }

    // 4. Email Fallback
    if (channels.includes('EMAIL')) {
      this.sendEmail(userId, title, message);
    }

    return savedNotification;
  }

  async sendPushNotification(userId, title, message, data) {
    // Implementation for Firebase Cloud Messaging
    console.log(`Sending Push Notification to User ${userId}: ${title}`);
  }

  async sendEmail(userId, title, message) {
    // Mock user email lookup (in real world, fetch from User service or DB)
    const userEmail = 'user@example.com'; 
    
    try {
      await this.transporter.sendMail({
        from: `"${process.env.APP_NAME || 'Mehman'}" <notifications@airbnb-clone.com>`,
        to: userEmail,
        subject: title,
        text: message,
      });
      console.log(`Email sent to ${userEmail}`);
    } catch (error) {
      console.error('Email sending failed:', error);
    }
  }
}

export default new NotificationService();
