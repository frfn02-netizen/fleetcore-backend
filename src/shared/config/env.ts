import { config } from "dotenv";
import { debug } from "node:console";
import { z } from "zod";

config();

const envSchema = z.object({
    NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
    PORT : z.coerce.number().default(3000),
    HOST : z.string().default("0.0.0.0"),
    LOG_LEVEL : z.enum(["fatal", "error", "warn", "info", "debug", "trace"]).default("info"),
    DB_HOST: z.string().min(1),
    DB_PORT: z.coerce.number().default(5432),
    DB_USER: z.string().min(1),
    DB_PASSWORD: z.string().min(1),
    DB_NAME: z.string().min(1),
})
const _env = envSchema.safeParse(process.env);

if (!_env.success){
    console.log ("invalid environment variables: ", _env.error.format())
    process.exit(1);
}
export const env = _env.data