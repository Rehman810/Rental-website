import amqp from 'amqplib';

let connection = null;
let channel = null;

const QUEUES = {
  CHAT_MESSAGES: 'chat_messages_queue',
  NOTIFICATIONS: 'notifications_queue',
};

export const connectRabbitMQ = async () => {
  try {
    const rabbitUrl = process.env.RABBITMQ_URL || 'amqp://localhost';
    connection = await amqp.connect(rabbitUrl);
    channel = await connection.createChannel();

    // Assert queues
    for (const queue of Object.values(QUEUES)) {
      await channel.assertQueue(queue, { durable: true });
    }

    console.log('Connected to RabbitMQ');
    return { connection, channel };
  } catch (error) {
    console.error('RabbitMQ connection error:', error);
    process.exit(1);
  }
};

export const getChannel = () => channel;
export { QUEUES };
