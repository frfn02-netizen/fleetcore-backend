import { dbPool } from "../database/postgres";

export class PostgresTrackingRepository {
  async saveHistory(vehicleId: string, lng: number, lat: number): Promise<void> {
    const query = `
      INSERT INTO vehicle_tracking_history (vehicle_id, location)
      VALUES ($1, ST_SetSRID(ST_MakePoint($2, $3), 4326))
    `;
    
    try {
      await dbPool.query(query, [vehicleId, lng, lat]);
    } catch (error) {
      throw error; 
    }
  }

  async getHistory(vehicleId: string, startTime: string, endTime: string): Promise<any[]> {
    const query = `
      SELECT 
        id,
        vehicle_id,
        ST_X(location::geometry) as longitude,
        ST_Y(location::geometry) as latitude,
        recorded_at
      FROM vehicle_tracking_history
      WHERE vehicle_id = $1 
        AND recorded_at BETWEEN $2 AND $3
      ORDER BY recorded_at ASC
    `;

    try {
      const result = await dbPool.query(query, [vehicleId, startTime, endTime]);
      return result.rows;
    } catch (error) {
      throw error;
    }
  }
}