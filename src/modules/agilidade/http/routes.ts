import { FastifyInstance } from "fastify";
import { agilidade24041 } from "./controllers/24041/agilidade-24041.controller";

const basePath =
  process.env.NODE_ENV === "pre" ? "/preinsight360api" : "/Insight360api";

export function agilidadeRoutes(app: FastifyInstance) {
  app.post(`${basePath}/ws/agilidade/24041/`, agilidade24041);
}
