import { Client } from "../../../../../repositories/types/leads-repository";

declare module "fastify" {
  interface FastifyRequest {
    client: Client;
  }
}
