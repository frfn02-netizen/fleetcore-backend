import Redis from 'ioredis';
import { env } from '@/shared/config/env';
import { logger } from '@/infrastructure/logger/logger';

// Membuat instance Redis
export const redisClient = new Redis({
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  lazyConnect: true, // Jangan langsung connect saat file di-import, biarkan kita kontrol secara manual
});

redisClient.on('error', (err) => {
  logger.error(err, '❌ Redis connection error');
});

export const connectRedis = async (): Promise<void> => {
  try {
    await redisClient.connect();
    logger.info('Redis Connected');
  } catch (err) {
    logger.error('Failed to connect to Redis');
    process.exit(1); 
  }
};