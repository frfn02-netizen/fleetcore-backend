import Fastify, { FastifyInstance } from 'fastify';
import { logger } from '@/infrastructure/logger/logger';
import { authRoutes } from '@/presentation/http/routes/auth-routes';

export const buildServer = (): FastifyInstance => {
  const server = Fastify({
    logger: logger, 
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Register API Routes
  server.register(authRoutes);

  return server;
};