import amqp from 'amqplib';

let connection = null;
let channel = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost';

export const connectRabbitMQ = async () => {
    try {
        if (connection) return { connection, channel };

        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        console.log('Connected to RabbitMQ');

        // Ensure queues exist
        await channel.assertQueue('wishlist_events', { durable: true });
        await channel.assertQueue('email_notifications', { durable: true });

        return { connection, channel };
    } catch (error) {
        console.error('RabbitMQ connection error:', error);
        throw error;
    }
};

export const publishEvent = async (queue, data) => {
    try {
        const { channel } = await connectRabbitMQ();
        channel.sendToQueue(queue, Buffer.from(JSON.stringify(data)), {
            persistent: true
        });
        console.log(`Event published to ${queue}`);
    } catch (error) {
        console.error('Error publishing event:', error);
    }
};
