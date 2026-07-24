import { Server as SocketIOServer } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { logger } from '@/infrastructure/logger/logger';

let io: SocketIOServer;

export const initializeWebSocket = (fastify: FastifyInstance): void => {
  // socket.io harus di-attach ke native HTTP server milik Fastify
  io = new SocketIOServer(fastify.server, {
    cors: {
      origin: '*', // Untuk development. Di production harus spesifik.
      methods: ['GET', 'POST'],
    },
  });

  io.on('connection', (socket) => {
    logger.info(`🔌 Client connected to WebSocket: ${socket.id}`);

    // Contoh listener saat client disconnect
    socket.on('disconnect', () => {
      logger.info(`🔌 Client disconnected: ${socket.id}`);
    });
  });

  logger.info('✅ WebSocket Server Initialized');
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};