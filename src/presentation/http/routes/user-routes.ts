import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { requireAuth } from '@/presentation/http/middlewares/auth-middleware';
import { requireRole } from '@/presentation/http/middlewares/rbac-middleware';
import { SYSTEM_ROLES } from '@/shared/constants/roles';

export const userRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  
  // Endpoint profil umum (Bisa diakses SIAPA SAJA yang punya token valid)
  server.get('/api/users/me', { preHandler: [requireAuth] }, async (request, reply) => {
    const userPayload = request.user!;
    return reply.status(200).send({
      success: true,
      message: 'Profile retrieved successfully',
      data: { id: userPayload.userId, role_id: userPayload.roleId },
    });
  });

  // Endpoint khusus Admin (HANYA SUPER_ADMIN yang boleh akses)
  // Perhatikan urutan preHandler: pastikan login dulu (requireAuth), baru cek role (requireRole)
  server.get(
    '/api/users/admin-only', 
    { preHandler: [requireAuth, requireRole([SYSTEM_ROLES.SUPER_ADMIN])] }, 
    async (request, reply) => {
      return reply.status(200).send({
        success: true,
        message: 'Welcome, Super Admin. You have access to restricted system data.',
      });
    }
  );
};