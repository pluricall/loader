import { FastifyInstance } from "fastify";
import { minisom21051 } from "./controllers/21051/minisom-21051.controller";
import { minisom21121 } from "./controllers/21121/minisom-21121.controller";
import { minisomCorporate } from "./controllers/corporate/minisom-corporate.controller";

export function minisomRoutes(app: FastifyInstance) {
  app.post(`/ws/minisom/21051/`, minisom21051);
  app.post(`/ws/minisom/21121/`, minisom21121);
  app.post(`/ws/minisom/21011/`, minisomCorporate);
}
