import { redisClient } from '@/infrastructure/cache/redis';
import { logger } from '@/infrastructure/logger/logger';

export class TrackingService {
  
  // Menggunakan tipe data bawaan Redis untuk Geospatial
  private readonly GEO_KEY = 'fleet_locations';

  async updateVehicleLocation(vehicleId: string, latitude: number, longitude: number): Promise<void> {
    try {
      // Redis GEOADD format: GEOADD key longitude latitude member
      // Perhatikan urutannya: Longitude dulu, baru Latitude. Ini standar GeoJSON.
      await redisClient.geoadd(this.GEO_KEY, longitude, latitude, vehicleId);
      
      // Kita juga simpan timestamp terakhir kendaraan tersebut update
      // HSET: Hash Set (menyimpan key-value di dalam key utama)
      await redisClient.hset('fleet_last_update', vehicleId, Date.now());
      
    } catch (error) {
      logger.error({ err: error, vehicleId }, 'Failed to update vehicle location in Redis');
      // Di sistem production, error ini biasanya dilempar ke sistem antrean (Dead Letter Queue)
      // Untuk sekarang, kita log saja agar tidak mematikan koneksi websocket.
    }
  }
}