import { dbPool } from '@/infrastructure/database/postgres';

export class PostgresGeofenceRepository {
  async isOutOfBounds(lng: number, lat: number): Promise<boolean> {
    const query = `
      SELECT id 
      FROM geofences 
      WHERE is_active = true 
        AND ST_Within(
          ST_SetSRID(ST_MakePoint($1, $2), 4326), 
          area
        )
      LIMIT 1;
    `;
    
    try {
      const result = await dbPool.query(query, [lng, lat]);
      return result.rowCount === 0;
    } catch (error) {
      throw error;
    }
  }
}