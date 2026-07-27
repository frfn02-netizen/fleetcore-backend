import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { TrackingService } from '@/application/services/tracking-service';
import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env';

const geospatialQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().positive().default(10), // Default radius 10 km
});

const historyQuerySchema = z.object({
  start_time: z.string().datetime(), // Memastikan format waktu ISO 8601 valid
  end_time: z.string().datetime(),
});

export const trackingRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const trackingService = new TrackingService();

  // 1. Endpoint untuk memantau kendaraan terdekat
  server.get('/api/tracking/nearby', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ success: false, message: 'Unauthorized: Token missing' });
      }

      const token = authHeader.split(' ')[1];
      jwt.verify(token, env.JWT_SECRET);

      const parsedQuery = geospatialQuerySchema.safeParse(request.query);
      if (!parsedQuery.success) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid query parameters (lat, lng, radius required)',
          errors: parsedQuery.error.format(),
        });
      }

      const { lat, lng, radius } = parsedQuery.data;
      const vehicles = await trackingService.getNearbyVehicles(lng, lat, radius);

      return reply.status(200).send({
        success: true,
        count: vehicles.length,
        data: vehicles,
      });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return reply.status(401).send({ success: false, message: 'Invalid token' });
      }

      server.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });

  // 2. Endpoint untuk mengambil riwayat perjalanan kendaraan (History / Playback)
  server.get('/api/tracking/history/:vehicleId', async (request, reply) => {
    try {
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ success: false, message: 'Unauthorized: Token missing' });
      }

      const token = authHeader.split(' ')[1];
      jwt.verify(token, env.JWT_SECRET);

      const { vehicleId } = request.params as { vehicleId: string };
      const parsedQuery = historyQuerySchema.safeParse(request.query);

      if (!parsedQuery.success) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid query parameters (start_time and end_time in ISO format required)',
          errors: parsedQuery.error.format(),
        });
      }

      const { start_time, end_time } = parsedQuery.data;
      const historyData = await trackingService.getVehicleHistory(vehicleId, start_time, end_time);

      return reply.status(200).send({
        success: true,
        count: historyData.length,
        data: historyData,
      });
    } catch (error: any) {
      if (error.name === 'JsonWebTokenError') {
        return reply.status(401).send({ success: false, message: 'Invalid token' });
      }

      server.log.error(error);
      return reply.status(500).send({ success: false, message: 'Internal Server Error' });
    }
  });
};