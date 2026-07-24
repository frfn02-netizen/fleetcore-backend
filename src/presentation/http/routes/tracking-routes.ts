import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { TrackingService } from '@/application/services/tracking-service';
import { SYSTEM_ROLES } from '@/shared/constants/roles';
import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env';

const geospatialQuerySchema = z.object({
  lat: z.coerce.number(),
  lng: z.coerce.number(),
  radius: z.coerce.number().positive().default(10), // Default radius 10 km
});

export const trackingRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const trackingService = new TrackingService();

  // Endpoint untuk memantau kendaraan terdekat (Hanya untuk Admin / Manager)
  server.get('/api/tracking/nearby', async (request, reply) => {
    try {
      // Verifikasi token sederhana untuk REST API
      const authHeader = request.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return reply.status(401).send({ success: false, message: 'Unauthorized: Token missing' });
      }

      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, env.JWT_SECRET) as { roleId: number };

      // Validasi hak akses (Opsional: Batasi hanya untuk Admin/Manager, atau biarkan semua user terautentikasi)
      
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
};