import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { makeRemoveClientUseCase } from "../../../use-cases/factories/make-remove-client-use-case";
import { z } from "zod";

export async function removeClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateParamsSchema = z.object({
    clientId: z.string().uuid({ message: "ID inválido. Deve ser um UUID." }),
  });

  const { clientId } = updateParamsSchema.parse(request.params);

  try {
    const removeClientUseCase = makeRemoveClientUseCase();
    await removeClientUseCase.execute({ clientId });

    return reply.status(200).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ error });
  }
}
