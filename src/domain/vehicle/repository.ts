import { Vehicle, CreateVehicleDTO } from "./entity";

export interface IVehicleRepository {
    create(data: CreateVehicleDTO): Promise<Vehicle>
    findByLicensePlate(licensePlate: string): Promise<Vehicle | null>
}

