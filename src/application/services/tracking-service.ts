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
  // Mencari kendaraan dalam radius kilometer tertentu dari titik koordinat pusat
  async getNearbyVehicles(longitude: number, latitude: number, radiusKm: number): Promise<any[]> {
    try {
      // Menggunakan GEOSEARCH untuk mencari member dalam radius (unit: km)
      // Format: GEOSEARCH key FROMLONLAT lng lat BYRADIUS radius km WITHCOORD WITHDIST
      const results = await redisClient.geosearch(
        this.GEO_KEY,
        'FROMLONLAT',
        longitude,
        latitude,
        'BYRADIUS',
        radiusKm,
        'km',
        'WITHCOORD',
        'WITHDIST'
      );

      // Hasil dari ioredis dengan flag di atas berbentuk array: [ [member, distance, [lng, lat]], ... ]
      return results.map((item: any) => ({
        vehicleId: item[0],
        distanceKm: parseFloat(item[1]),
        coordinates: {
          longitude: parseFloat(item[2][0]),
          latitude: parseFloat(item[2][1]),
        },
      }));
    } catch (error) {
      logger.error({ err: error }, 'Failed to query nearby vehicles from Redis');
      throw new Error('Failed to retrieve fleet locations');
    }
  }
}