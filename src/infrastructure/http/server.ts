import Fastify, { FastifyInstance } from 'fastify';
import { trackingRoutes } from '@/presentation/http/routes/tracking-routes';
import { logger } from '@/infrastructure/logger/logger';
import { vehicleRoutes } from '@/presentation/http/routes/vehicle-routes';
import { userRoutes } from '@/presentation/http/routes/user-routes';
import { authRoutes } from '@/presentation/http/routes/auth-routes';

export const buildServer = () => {
  const server = Fastify({
    loggerInstance: logger, 
  });

  // Health check endpoint
  server.get('/health', async () => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  // Register API Routes
  server.register(authRoutes);
  server.register(userRoutes);
  server.register(vehicleRoutes);
  server.register(trackingRoutes);

  return server;
};