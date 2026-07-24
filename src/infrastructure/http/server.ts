import Fastify, { FastifyInstance } from 'fastify';
import { logger } from '@/infrastructure/logger/logger';
import { userRoutes } from '@/presentation/http/routes/user-routes';
import { authRoutes } from '@/presentation/http/routes/auth-routes';

export const buildServer = (): FastifyInstance => {
  const server = Fastify({
    loggerInstance: logger, 
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Register API Routes
  server.register(authRoutes);
  server.register(userRoutes)

  return server;
};