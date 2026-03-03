import { FastifyReply, FastifyRequest } from "fastify";
import { makeSearchClientsUseCase } from "../../../use-cases/factories/make-search-clients-use-case";

export async function searchClients(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const searchClientsUseCase = makeSearchClientsUseCase();
    const { clients } = await searchClientsUseCase.execute();

    return reply.status(200).send({ clients });
  } catch (error) {
    return reply.status(500).send();
  }
}
