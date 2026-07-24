import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { requireAuth } from '@/presentation/http/middlewares/auth-middleware';

export const userRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  
 
  server.get('/api/users/me', { preHandler: [requireAuth] }, async (request, reply) => {
    
    const userPayload = request.user!;

    return reply.status(200).send({
      success: true,
      message: 'Profile retrieved successfully',
      data: {
        id: userPayload.userId,
        role_id: userPayload.roleId,
      },
    });
  });
};