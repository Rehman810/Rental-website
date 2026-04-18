import http from 'http';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import app from './app.js';
import { initializeSocket } from './socket/socket.gateway.js';
import { connectRedis } from './config/redis.js';
import { connectRabbitMQ } from './config/rabbitmq.js';
import { startConsumers } from './events/consumers/index.js';

dotenv.config();

const PORT = process.env.PORT || 4001;
const server = http.createServer(app);

const startServer = async () => {
  try {
    // 1. Connect MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // 2. Connect Redis
    await connectRedis();

    // 3. Initialize Socket.io (with Redis Adapter)
    initializeSocket(server);

    // 4. Connect RabbitMQ & Start Consumers
    await connectRabbitMQ();
    await startConsumers();

    server.listen(PORT, () => {
      console.log(`Chat-Notification Service running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
