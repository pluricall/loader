import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { makeSearchLeadClientsUseCase } from "../../../use-cases/factories/make-search-lead-clients-use-case";

export async function searchLeadClients(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const searchLeadClientsSchema = z.object({
    client_name: z.string().nonempty("It must contain a client name!"),
  });

  const { client_name } = searchLeadClientsSchema.parse(request.params);

  try {
    const searchLeadClientsUseCase = makeSearchLeadClientsUseCase();
    const { client, config, mapping } =
      await searchLeadClientsUseCase.execute(client_name);

    return reply.status(200).send({ client, config, mapping });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({
      error: `Não foi possível buscar os clientes. Contacte o administrador de IT: ${error}`,
    });
  }
}
