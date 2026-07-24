import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '@/application/services/auth-service';
import { PostgresUserRepository } from '@/infrastructure/repositories/user-repository';

// ... (registerSchema tetap biarkan) ...

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'), // Saat login, kita tidak perlu memvalidasi minimal 8 karakter, cukup pastikan tidak kosong
});

export const authRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const userRepository = new PostgresUserRepository();
  const authService = new AuthService(userRepository);


  server.post('/api/auth/login', async (request, reply) => {
    try {
      const parsedBody = loginSchema.safeParse(request.body);
      
      if (!parsedBody.success) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid input',
          errors: parsedBody.error.format(),
        });
      }

      const { email, password } = parsedBody.data;

      // Panggil Service Login
      const result = await authService.login(email, password);

      return reply.status(200).send({
        success: true,
        message: 'Login successful',
        data: result,
      });

    } catch (error: any) {
      if (error.message === 'Invalid email or password') {
        return reply.status(401).send({
          success: false,
          message: error.message,
        });
      }

      server.log.error(error);
      return reply.status(500).send({
        success: false,
        message: 'Internal Server Error',
      });
    }
  });
};