import { buildServer } from '@/infrastructure/http/server';
import { env } from '@/shared/config/env';
import { logger } from '@/infrastructure/logger/logger';
import { connect } from 'node:http2';
import { connectDB } from './infrastructure/database/postgres';

const start = async () => {
  try {

    await connectDB()

    const server = buildServer();
    
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