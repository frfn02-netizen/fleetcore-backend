import { IVehicleRepository } from '@/domain/vehicle/repository';
import { Vehicle, CreateVehicleDTO } from '@/domain/vehicle/entity';
import { dbPool } from '@/infrastructure/database/postgres';

export class PostgresVehicleRepository implements IVehicleRepository {
  
  async findByLicensePlate(licensePlate: string): Promise<Vehicle | null> {
    const query = 'SELECT * FROM vehicles WHERE license_plate = $1 AND deleted_at IS NULL LIMIT 1';
    const result = await dbPool.query(query, [licensePlate]);
    
    return result.rows[0] || null;
  }

  async create(data: CreateVehicleDTO): Promise<Vehicle> {
    const query = `
      INSERT INTO vehicles (license_plate, type, capacity_weight_kg)
      VALUES ($1, $2, $3)
      RETURNING *
    `;
    const values = [data.license_plate, data.type, data.capacity_weight_kg];
    const result = await dbPool.query(query, values);
    
    return result.rows[0];
  }
}