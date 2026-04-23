import { FastifyReply, FastifyRequest } from "fastify";
import { makeFindAllReportsUseCase } from "../../use-cases/factories/make-find-all";

export async function findAllReportsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeFindAllReportsUseCase();

    const reports = await useCase.execute();

    return reply.status(200).send(reports);
  } catch (error) {
    console.error(error);

    throw error;
  }
}
