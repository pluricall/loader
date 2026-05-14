import { FastifyRequest, FastifyReply } from "fastify";
import { makeAgilidadeRecordingsUseCase } from "../../../application/use-cases/factories/agilidade-recordings.factory";

export async function agilidadeRecordingsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makeAgilidadeRecordingsUseCase();
    await useCase.execute({
      endDate: "2026-04-15",
      initialDate: "2026-04-15",
      limit: 10,
    });
    return reply.status(200).send({ message: "Processamento concluído" });
  } catch (error: any) {
    console.error("Error in agilidadeRecordingsController:", error);
    throw error;
  }
}
