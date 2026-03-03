import { FastifyRequest, FastifyReply } from "fastify";
import { makeSearchTypsUseCase } from "../../../use-cases/factories/make-search-typs-use-case";

export async function searchTyps(request: FastifyRequest, reply: FastifyReply) {
  try {
    const searchTypsUseCase = makeSearchTypsUseCase();
    const typs = await searchTypsUseCase.execute();

    reply.send(typs);
  } catch (error) {
    return reply.status(500).send();
  }
}
