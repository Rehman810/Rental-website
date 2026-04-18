import { Server } from 'socket.io';
import { createAdapter } from '@socket.io/redis-adapter';
import { getRedisClient } from '../config/redis.js';
import jwt from 'jsonwebtoken';

let io = null;

export const initializeSocket = (server) => {
  const pubClient = getRedisClient();
  const subClient = pubClient.duplicate();

  io = new Server(server, {
    cors: {
      origin: '*', // Adjust to your frontend URL in production
      methods: ['GET', 'POST'],
    },
  });

  io.adapter(createAdapter(pubClient, subClient));

  // Middleware for Authentication
  io.use((socket, next) => {
    const token = socket.handshake.auth.token || socket.handshake.query.token;
    if (!token) {
      return next(new Error('Authentication error: No token provided'));
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
      if (err) return next(new Error('Authentication error: Invalid token'));
      socket.user = decoded;
      next();
    });
  });

  io.on('connection', (socket) => {
    const userId = socket.user._id || socket.user.id;
    console.log(`User connected: ${userId} (Socket: ${socket.id})`);

    // Join a room specifically for this user to enable targeted emits
    socket.join(userId.toString());

    socket.on('join_room', (roomId) => {
      socket.join(roomId);
      console.log(`User ${userId} joined room: ${roomId}`);
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${userId}`);
    });
  });

  return io;
};

export const getIO = () => {
  if (!io) {
    throw new Error('Socket.io NOT initialized!');
  }
  return io;
};

/**
 * Emit to a specific user across all instances
 * @param {string} userId 
 * @param {string} event 
 * @param {any} data 
 */
export const emitToUser = (userId, event, data) => {
  if (io) {
    io.to(userId.toString()).emit(event, data);
  }
};
