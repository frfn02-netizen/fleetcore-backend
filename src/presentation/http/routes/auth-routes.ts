import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '@/application/services/auth-service';
import { PostgresUserRepository } from '@/infrastructure/repositories/user-repository';

// Schema validasi input dari client menggunakan Zod
const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  role_id: z.number().int().positive(),
});

export const authRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  // Manual Dependency Injection Wiring
  const userRepository = new PostgresUserRepository();
  const authService = new AuthService(userRepository);

  server.post('/api/auth/register', async (request, reply) => {
    try {
      // 1. Validasi Input HTTP Body
      const parsedBody = registerSchema.safeParse(request.body);
      
      if (!parsedBody.success) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid input',
          errors: parsedBody.error.format(),
        });
      }

      const { email, password, role_id } = parsedBody.data;

      // 2. Eksekusi Business Logic
      const user = await authService.register(email, password, role_id);

      // 3. Kembalikan Response Berhasil
      return reply.status(201).send({
        success: true,
        message: 'User registered successfully',
        data: user,
      });

    } catch (error: any) {
      // Tangkap error dari Service (misal: Email sudah ada)
      if (error.message === 'Email is already registered') {
        return reply.status(409).send({
          success: false,
          message: error.message,
        });
      }

      // Log error internal server yang tidak terduga
      server.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal Server Error',
      });
    }
  });
};