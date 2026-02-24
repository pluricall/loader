import { FastifyReply, FastifyRequest } from "fastify";
import { MssqlLeadIntegrationRepository } from "../../modules/leads/infra/mssql/mssql-lead-integration-repository";

export async function apiKeyAuth(request: FastifyRequest, reply: FastifyReply) {
  const authHeader = request.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return reply.status(401).send({ error: "Missing API key" });
  }

  const apiKey = authHeader.replace("Bearer ", "");

  const repo = new MssqlLeadIntegrationRepository();
  const client = await repo.findByApiKey(apiKey);

  if (!client) {
    return reply.status(401).send({ error: "Invalid API key" });
  }

  request.client = client;
}
