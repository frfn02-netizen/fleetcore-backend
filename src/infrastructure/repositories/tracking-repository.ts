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
      // Kita lemparkan error agar Service tahu jika insert gagal
      throw error; 
    }
  }
}