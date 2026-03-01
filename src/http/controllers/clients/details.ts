import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../shared/errors/not-found-error";
import { makeGetClientDetailsUseCase } from "../../../use-cases/factories/make-get-client-details-use-case";

export async function clientDetails(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const detailsParamsSchema = z.object({
    id: z.string().uuid({ message: "ID inválido. Deve ser um UUID." }),
  });

  const { id } = detailsParamsSchema.parse(request.params);

  try {
    const getByIdClientesUseCase = makeGetClientDetailsUseCase();
    const { client } = await getByIdClientesUseCase.execute({ clientId: id });
    return reply.status(200).send(client);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
