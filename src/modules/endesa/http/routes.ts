import { FastifyInstance } from "fastify";
import { endesa22071Controller } from "./controllers/22071/endesa-22071.controller";

export async function endesaRoutes(app: FastifyInstance) {
  app.post(`/ws/endesa/22071/v2/`, endesa22071Controller);
}
