import { redisClient } from '@/infrastructure/cache/redis';
import { logger } from '@/infrastructure/logger/logger';
import { PostgresTrackingRepository } from '@/infrastructure/repositories/tracking-repository';

export class TrackingService {
  
  // Menggunakan tipe data bawaan Redis untuk Geospatial
  private readonly GEO_KEY = 'fleet_locations';
  private trackingRepository: PostgresTrackingRepository;

  constructor() {
    this.trackingRepository = new PostgresTrackingRepository();
  }

  async updateVehicleLocation(vehicleId: string, latitude: number, longitude: number): Promise<void> {
    try {

      await redisClient.geoadd(this.GEO_KEY, longitude, latitude, vehicleId);
      await redisClient.hset('fleet_last_update', vehicleId, Date.now());
      await this.trackingRepository.saveHistory(vehicleId, longitude, latitude);
      
    } catch (error) {
      logger.error({ err: error, vehicleId }, 'Failed to update vehicle location in Redis');
      throw new Error('Failed to update vehicle location');
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
  async getVehicleHistory(vehicleId: string, startTime: string, endTime: string): Promise<any[]> {
    try {
      const history = await this.trackingRepository.getHistory(vehicleId, startTime, endTime);
      return history;
    } catch (error) {
      logger.error({ err: error, vehicleId }, 'Failed to fetch vehicle tracking history');
      throw new Error('Failed to retrieve vehicle tracking history');
    }
  }
}