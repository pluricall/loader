import { RedisOptions } from "ioredis";
import { env } from "../../../env";

export const redisConnection: RedisOptions = {
  host: "3",
  port: env.REDIS_PORT,
  password: env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
};
