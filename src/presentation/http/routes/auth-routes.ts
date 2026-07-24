import { FastifyInstance, FastifyPluginAsync } from 'fastify';
import { z } from 'zod';
import { AuthService } from '@/application/services/auth-service';
import { PostgresUserRepository } from '@/infrastructure/repositories/user-repository';

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters long'),
  role_id: z.number().int().positive(),
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required'),
});

export const authRoutes: FastifyPluginAsync = async (server: FastifyInstance) => {
  const userRepository = new PostgresUserRepository();
  const authService = new AuthService(userRepository);

  // Endpoint Register
  server.post('/api/auth/register', async (request, reply) => {
    try {
      const parsedBody = registerSchema.safeParse(request.body);

      if (!parsedBody.success) {
        return reply.status(400).send({
          success: false,
          message: 'Invalid input',
          errors: parsedBody.error.format(),
        });
      }

      const { email, password, role_id } = parsedBody.data;

      const user = await authService.register(email, password, role_id);

      return reply.status(201).send({
        success: true,
        message: 'User registered successfully',
        data: user,
      });
    } catch (error: any) {
      if (error.message === 'Email is already registered') {
        return reply.status(409).send({
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

  // Endpoint Login
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