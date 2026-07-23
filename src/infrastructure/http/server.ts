import Fastify, { FastifyInstance } from 'fastify';
import { logger } from '@/infrastructure/logger/logger';

export const buildServer = (): FastifyInstance => {
  const server = Fastify({
    loggerInstance: logger, // Inject our Pino logger
    // disableRequestLogging: true, // We will create custom request logging later to avoid noise
  });

  // Health check endpoint
  server.get('/health', async (request, reply) => {
    return { status: 'OK', timestamp: new Date().toISOString() };
  });

  return server;
};