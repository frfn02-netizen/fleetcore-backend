import { redisClient } from "@/infrastructure/cache/redis";
import { logger } from "@/infrastructure/logger/logger";

export class TrackingService {
    private readonly GEO_KEY  = ' fleet_locations '

    async updateVehicleLocation(
        vehicleId: string,
        latitide: number,
        longitude: number): Promise<void> {
            try{
                await redisClient.geoadd(this.GEO_KEY, longitude, vehicleId)
                await redisClient.hset('fleet_last_update', vehicleId, Date.now())

            }catch (error){
                logger.error({err: error, vehicleId}, "Failed to update vehicle location in redis")

            }
        }
}