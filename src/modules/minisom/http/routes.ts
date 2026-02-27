import { FastifyInstance } from "fastify";
import { minisom21051 } from "./controllers/21051/minisom-21051.controller";
import { minisom21121 } from "./controllers/21121/minisom-21121.controller";
import { agilidade24041 } from "../../../http/controllers/agilidade/24041";
import { minisomCorporate } from "./controllers/corporate/minisom-corporate.controller";
import { servilusa23081 } from "../../../http/controllers/servilusa/23081";

export function minisomRoutes(app: FastifyInstance) {
  app.post(`/ws/minisom/21051/`, minisom21051);
  app.post(`/ws/minisom/21121/`, minisom21121);
  app.post(`/ws/minisom/21011/`, minisomCorporate);
  app.post(`/ws/agilidade/24041/`, agilidade24041);
  app.post(`/ws/servilusa/23081/`, servilusa23081);
}
