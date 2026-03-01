import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../../shared/errors/not-found-error";
import { makeSearchBdsUseCase } from "../../../use-cases/factories/make-search-bds-use-case";
import { z } from "zod";

export async function searchBds(request: FastifyRequest, reply: FastifyReply) {
  const searchBdsSchema = z.object({
    clientId: z.string().uuid(),
  });

  const { clientId } = searchBdsSchema.parse(request.params);

  try {
    const getBdDetailsUseCase = makeSearchBdsUseCase();
    const { bds } = await getBdDetailsUseCase.execute({ clientId });

    return reply.status(200).send({ bds });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
