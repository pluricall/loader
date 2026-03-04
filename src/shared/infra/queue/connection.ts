import { RedisOptions } from "ioredis";

export const redisConnection: RedisOptions = {
  host: "192.168.0.73",
  port: 6379,
  password: "cassini*06",
  retryStrategy: (times) => {
    return Math.min(times * 50, 2000);
  },
};
