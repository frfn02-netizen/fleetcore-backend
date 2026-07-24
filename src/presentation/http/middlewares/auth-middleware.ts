import { FastifyReply, FastifyRequest } from 'fastify';
import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env';

declare module 'fastify' {
  interface FastifyRequest {
    user?: {
      userId: string;
      roleId: number;
    };
  }
}

export const requireAuth = async (request: FastifyRequest, 
    reply: FastifyReply) => {
  const authHeader = request.headers.authorization;

  // 3. Cek format "Bearer <token>"
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return reply.status(401).send({ 
      success: false, 
      message: 'Unauthorized: Missing or invalid token format' 
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as 
    { userId: string; roleId: number };
    
    request.user = decoded;
  } catch (error) {
    return reply.status(401).send({ 
      success: false, 
      message: 'Unauthorized: Expired or invalid token' 
    });
  }
};