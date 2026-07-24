import { IVehicleRepository } from '@/domain/vehicle/repository';
import { Vehicle, CreateVehicleDTO } from '@/domain/vehicle/entity';

export class VehicleService {
  constructor(private readonly vehicleRepository: IVehicleRepository) {}

  async registerVehicle(data: CreateVehicleDTO): Promise<Vehicle> {
    // 1. Normalisasi Plat Nomor (Hapus spasi dan jadikan huruf kapital)
    // Contoh: " B 1234 cD " -> "B1234CD"
    const normalizedPlate = data.license_plate.replace(/\s+/g, '').toUpperCase();

    // 2. Cek apakah plat nomor sudah terdaftar
    const existingVehicle = await this.vehicleRepository.findByLicensePlate(normalizedPlate);
    if (existingVehicle) {
      throw new Error('License plate is already registered');
    }

    // 3. Simpan ke database
    return await this.vehicleRepository.create({
      ...data,
      license_plate: normalizedPlate,
    });
  }
}