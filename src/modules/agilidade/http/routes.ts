import { FastifyInstance } from "fastify";
import { agilidade24041 } from "./controllers/24041/agilidade-24041.controller";

export function agilidadeRoutes(app: FastifyInstance) {
  app.post(`/ws/agilidade/24041/`, agilidade24041);
}
