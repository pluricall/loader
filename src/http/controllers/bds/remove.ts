import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { z } from "zod";
import { makeRemoveBdUseCase } from "../../../use-cases/factories/make-remove-bd-use-case";

export async function removeBd(request: FastifyRequest, reply: FastifyReply) {
  const updateParamsSchema = z.object({
    clientId: z.string().uuid({ message: "ID inválido. Deve ser um UUID." }),
    bdId: z.string().uuid({ message: "ID inválido. Deve ser um UUID." }),
  });

  const { clientId, bdId } = updateParamsSchema.parse(request.params);

  try {
    const removeBdUseCase = makeRemoveBdUseCase();
    await removeBdUseCase.execute({ clientId, bdId });

    return reply.status(200).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ error });
  }
}
