import { Pool } from 'pg';
import { env } from '@/shared/config/env';
import { logger } from '@/infrastructure/logger/logger';

// Create a singleton connection pool
export const dbPool = new Pool({
  host: env.DB_HOST,
  port: env.DB_PORT,
  user: env.DB_USER,
  password: env.DB_PASSWORD,
  database: env.DB_NAME,
  max: 20, // Maximum number of clients in the pool
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
});

dbPool.on('error', (err) => {
  logger.error(err, 'Unexpected error on idle client');
  process.exit(-1);
});

export const connectDB = async (): Promise<void> => {
  try {
    const client = await dbPool.connect();
    
    // Check if PostGIS is enabled
    const res = await client.query('SELECT PostGIS_Version();');
    logger.info(`✅ Database Connected. PostGIS Version: ${res.rows[0].postgis_version}`);
    
    client.release();
  } catch (err) {
    logger.error({ err }, '❌ Failed to connect to the database');
    throw err;
  }
};