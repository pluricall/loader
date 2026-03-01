import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../shared/errors/not-found-error";
import { makeGetBdDetailsUseCase } from "../../../use-cases/factories/make-get-bd-details-use-case";

export async function bdDetails(request: FastifyRequest, reply: FastifyReply) {
  const searchBdsSchema = z.object({
    clientId: z.string().uuid(),
    bdId: z.string().uuid(),
  });

  const { clientId, bdId } = searchBdsSchema.parse(request.params);

  try {
    const getBdDetailsUseCase = makeGetBdDetailsUseCase();
    const { bd } = await getBdDetailsUseCase.execute({ clientId, bdId });

    return reply.status(200).send({ bd });
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: "Internal server error" });
  }
}
