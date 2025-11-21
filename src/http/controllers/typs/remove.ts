import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { makeRemoveTypUseCase } from "../../../use-cases/factories/make-remove-typ-use-case";

export async function removeTyp(request: FastifyRequest, reply: FastifyReply) {
  const deleteParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const { id } = deleteParamsSchema.parse(request.params);

  try {
    const deleteTypUseCase = makeRemoveTypUseCase();
    await deleteTypUseCase.execute({ typId: id });
    reply.status(200).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
