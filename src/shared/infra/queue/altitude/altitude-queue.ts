import { Queue } from "bullmq";
import { redisConnection } from "../connection";

export const altitudeQueue = new Queue("altitude-create-contact", {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5,
    backoff: {
      type: "exponential",
      delay: 3000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});
