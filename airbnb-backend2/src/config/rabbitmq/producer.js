import amqp from 'amqplib';

let connection = null;
let channel = null;

const QUEUES = {
  CHAT_MESSAGES: 'chat_messages_queue',
  NOTIFICATIONS: 'notifications_queue',
};

const connectRabbitMQ = async () => {
  try {
    if (channel) return channel;
    
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();

    await channel.assertQueue(QUEUES.CHAT_MESSAGES, { durable: true });
    await channel.assertQueue(QUEUES.NOTIFICATIONS, { durable: true });

    return channel;
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    return null;
  }
};

export const publishEvent = async (queue, event, data) => {
  const ch = await connectRabbitMQ();
  if (ch) {
    const payload = JSON.stringify({ event, data, timestamp: new Date() });
    ch.sendToQueue(queue, Buffer.from(payload), { persistent: true });
    console.log(`Event published to ${queue}: ${event}`);
  }
};

export const publishNotification = async (payload) => {
  const ch = await connectRabbitMQ();
  if (ch) {
    ch.sendToQueue(QUEUES.NOTIFICATIONS, Buffer.from(JSON.stringify(payload)), { persistent: true });
    console.log(`Notification event published`);
  }
};

export { QUEUES };
