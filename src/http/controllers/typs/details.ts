import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { makeGetTypDetailsUseCase } from "../../../use-cases/factories/make-get-typ-details-use-case";

export async function typDetails(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    id: z.string().uuid({ message: "ID inválido. Deve ser um UUID." }),
  });

  const data = paramsSchema.parse(request.params);

  try {
    const getTypByIdUseCase = makeGetTypDetailsUseCase();
    const typ = await getTypByIdUseCase.execute(data.id);
    return reply.status(200).send(typ);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
