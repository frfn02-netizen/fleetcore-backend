import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import { env } from '@/shared/config/env';
import { logger } from '@/infrastructure/logger/logger';
import { TrackingService } from '@/application/services/tracking-service';
import { SYSTEM_ROLES } from '@/shared/constants/roles';

export const setupSocketHandlers = (io: Server) => {
  const trackingService = new TrackingService();

  // 1. WebSocket Authentication Middleware
  io.use((socket, next) => {
    // Klien harus mengirim token saat inisialisasi koneksi via 'auth' object
    const token = socket.handshake.auth.token;

    if (!token) {
      return next(new Error('Authentication error: Token missing'));
    }

    try {
      const decoded = jwt.verify(token, env.JWT_SECRET) as { userId: string; roleId: number };
      
      // Cuma Supir (DRIVER) yang boleh mengirim koordinat
      if (decoded.roleId !== SYSTEM_ROLES.DRIVER) {
        return next(new Error('Authorization error: Only drivers can transmit GPS'));
      }

      // Simpan data user di objek socket agar bisa dipakai di event listener nanti
      socket.data.user = decoded;
      next();
    } catch (error) {
      return next(new Error('Authentication error: Invalid token'));
    }
  });

  // 2. Event Listeners (Route untuk WebSocket)
  io.on('connection', (socket: Socket) => {
    const userId = socket.data.user.userId;
    logger.info(`🚚 Driver connected to tracking engine. UserID: ${userId}, SocketID: ${socket.id}`);

    // Mendengarkan event 'update_location' dari aplikasi supir
    socket.on('update_location', async (data: { vehicleId: string; lat: number; lng: number }) => {
      // Validasi struktur data mentah (fail-safe)
      if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number' || !data.vehicleId) {
        logger.warn(`Invalid location payload from ${socket.id}`);
        return; 
      }

      // Eksekusi business logic (Simpan ke Redis)
      await trackingService.updateVehicleLocation(data.vehicleId, data.lat, data.lng);
      
      // Opsional: Log untuk mode development agar kita tahu data masuk
      logger.debug(`📍 Location updated | Vehicle: ${data.vehicleId} | Lat: ${data.lat}, Lng: ${data.lng}`);
    });

    socket.on('disconnect', () => {
      logger.info(`🚚 Driver disconnected. UserID: ${userId}`);
    });
  });
};