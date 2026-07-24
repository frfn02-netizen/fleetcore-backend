import { buildServer } from '@/infrastructure/http/server';
import { env } from '@/shared/config/env';
import { logger } from '@/infrastructure/logger/logger';
import { connectDB } from './infrastructure/database/postgres';
import { connectRedis } from './infrastructure/cache/redis';
import { initializeWebSocket } from './infrastructure/websocket/socket';

const start = async () => {
  try {

    await connectDB()
    await connectRedis()

    const server = buildServer();
    
    initializeWebSocket(server)
    
    // Start listening
    await server.listen({ port: env.PORT, host: env.HOST });

    logger.info(`🚀 FleetCore Server is running on http://${env.HOST}:${env.PORT}`);
    
    logger.info(`Environment: ${env.NODE_ENV}`);
  } catch (error) {
    logger.error(error);
    process.exit(1);
  }
};

start();