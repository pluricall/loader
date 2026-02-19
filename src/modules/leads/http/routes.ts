import { FastifyInstance } from "fastify";
import { createLeadConfigController } from "./controllers/create";
import { loadLeadController } from "./controllers/load";
import { apiKeyAuth } from "./middleware/api-key";

const basePath =
  process.env.NODE_ENV === "pre" ? "/preinsight360api" : "/insight360api";

export async function leadRoutes(app: FastifyInstance) {
  app.post(`${basePath}/leads/config`, createLeadConfigController);
  app.post(
    `${basePath}/leads/load`,
    { preHandler: apiKeyAuth },
    loadLeadController,
  );
}
