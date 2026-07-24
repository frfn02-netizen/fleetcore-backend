export type VehicleType = 'MOTORCYCLE' | 'CAR' | 'VAN' | 'TRUCK';
export type VehicleStatus = 'ACTIVE' | 'MAINTENANCE' | 'RETIRED';

export interface Vehicle {
  id: string;
  license_plate: string;
  type: VehicleType;
  capacity_weight_kg: number;
  status: VehicleStatus;
  created_at: Date;
  updated_at: Date;
  deleted_at: Date | null;
}

// data input yang dibutuhkan saat membuat kendaraan baru
export type CreateVehicleDTO = Omit<Vehicle, 'id' | 'created_at' | 'updated_at' | 'deleted_at' | 'status'>;