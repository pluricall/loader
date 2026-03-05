import { FastifyInstance } from "fastify";
import { parseAgildadeBody } from "./middlewares/parse-agilidade-body.middleware";
import { agilidade24041Controller } from "./controllers/24041/agilidade-24041.controller";

export async function agilidadeRoutes(app: FastifyInstance) {
  app.post(
    `/ws/agilidade/24041/`,
    { preHandler: parseAgildadeBody },
    agilidade24041Controller,
  );
}
