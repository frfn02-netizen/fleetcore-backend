import { Server as SocketIOServer } from 'socket.io';
import { FastifyInstance } from 'fastify';
import { logger } from '@/infrastructure/logger/logger';
import { setupSocketHandlers } from '@/presentation/websocket/socket-handler'; // <-- 1. Import ini

let io: SocketIOServer;

export const initializeWebSocket = (fastify: FastifyInstance): void => {
  io = new SocketIOServer(fastify.server, {
    cors: {
      origin: '*', 
      methods: ['GET', 'POST'],
    },
  });

  // 2. Panggil fungsi penyetel handler dan middleware
  setupSocketHandlers(io);

  logger.info('✅ WebSocket Server Initialized & Handlers Attached');
};

export const getIO = (): SocketIOServer => {
  if (!io) {
    throw new Error('Socket.IO has not been initialized!');
  }
  return io;
};