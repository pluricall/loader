import { RedisOptions } from "ioredis";
import { env } from "../../../env";

export const redisConnection: RedisOptions = {
  host: env.REDIS_HOST,
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
};
