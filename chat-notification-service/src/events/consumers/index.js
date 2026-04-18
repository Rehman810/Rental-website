import { getChannel, QUEUES } from '../../config/rabbitmq.js';
import notificationService from '../../services/notification.service.js';
import chatService from '../../services/chat.service.js';

export const startConsumers = async () => {
  const channel = getChannel();

  // 1. Notification Consumer (Generic)
  channel.consume(QUEUES.NOTIFICATIONS, async (msg) => {
    if (msg !== null) {
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log('Received Notification Event:', payload.type);
        
        await notificationService.notify(payload);
        
        channel.ack(msg);
      } catch (error) {
        console.error('Error processing notification event:', error);
        // Nack with requeue if transient error, or move to DLQ
        channel.nack(msg, false, false);
      }
    }
  });

  // 2. Chat Consumer
  channel.consume(QUEUES.CHAT_MESSAGES, async (msg) => {
    if (msg !== null) {
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log('Received Chat Event:', payload.event);

        if (payload.event === 'MESSAGE_SENT') {
          await chatService.sendMessage(
            payload.data.senderId,
            payload.data.receiverId,
            payload.data.message,
            payload.data.listingId,
            payload.data.role
          );
        }

        channel.ack(msg);
      } catch (error) {
        console.error('Error processing chat event:', error);
        channel.nack(msg, false, false);
      }
    }
  });

  console.log('RabbitMQ Consumers started');
};
