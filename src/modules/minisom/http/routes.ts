import { FastifyInstance } from "fastify";
import { minisom21051 } from "./controllers/21051/minisom-21051.controller";

export function minisomRoutes(app: FastifyInstance) {
  app.post(`/ws/minisom/21051/`, minisom21051);
}
