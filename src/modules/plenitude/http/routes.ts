import { FastifyInstance } from "fastify";
import { plenitudeInsert } from "./controllers/insert";

export function plenitudeRoutes(app: FastifyInstance) {
  app.post(`/plenitude/return-data`, plenitudeInsert);
}
