import { FastifyRequest, FastifyReply } from "fastify";
import { processLeadsAgilidade } from "./AgilidadeServices";

export class LeadsController {
  async AgilidadeLeads(req: FastifyRequest, reply: FastifyReply) {
    const fastify = req.server;
    try {
      const result = await processLeadsAgilidade(fastify);
      reply.send(result);
    } catch (err) {
      fastify.log.error(err);
      reply.status(500).send({ error: "Erro ao processar leads" });
    }
  }
}
