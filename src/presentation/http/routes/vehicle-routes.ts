import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { PostgresVehicleRepository } from '@/infrastructure/repositories/vehicle-repository';
import { VehicleService } from '@/application/services/vehicle-service';
import { requireAuth } from '@/presentation/http/middlewares/auth-middleware';
import { requireRole } from '@/presentation/http/middlewares/rbac-middleware';
import { SYSTEM_ROLES } from '@/shared/constants/roles';

// Validasi input dari client
const createVehicleSchema = z.object({
  license_plate: z.string().min(3),
  type: z.enum(['MOTORCYCLE', 'CAR', 'VAN', 'TRUCK']),
  capacity_weight_kg: z.number().int().nonnegative(),
});

export const vehicleRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const vehicleRepository = new PostgresVehicleRepository();
  const vehicleService = new VehicleService(vehicleRepository);

  
  server.post(
    '/api/vehicles',
    {
      preHandler: [
        requireAuth,
        requireRole([SYSTEM_ROLES.SUPER_ADMIN, SYSTEM_ROLES.FLEET_MANAGER]),
      ],
    },
    async (request, reply) => {
      try {
        const parsedBody = createVehicleSchema.safeParse(request.body);

        if (!parsedBody.success) {
          return reply.status(400).send({
            success: false,
            message: 'Invalid input',
            errors: parsedBody.error.format(),
          });
        }

        const vehicle = await vehicleService.registerVehicle(parsedBody.data);

        return reply.status(201).send({
          success: true,
          message: 'Vehicle registered successfully',
          data: vehicle,
        });
      } catch (error: any) {
        if (error.message === 'License plate is already registered') {
          return reply.status(409).send({ success: false, message: error.message });
        }
        server.log.error(error);
        return reply.status(500).send({ success: false, message: 'Internal Server Error' });
      }
    }
  );
};