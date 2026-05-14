import { FastifyRequest, FastifyReply } from "fastify";
import { makePlenitudeRecordingsUseCase } from "../../application/factories/make-plenitude-recordings";

export async function sendRecordingsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const useCase = makePlenitudeRecordingsUseCase();
    useCase.execute({
      endDate: "2026-05-12",
      initialDate: "2026-05-12",
    });
    return reply.status(200).send({ message: "Processamento concluído" });
  } catch (error: any) {
    console.error("Error in sendRecordingsController:", error);
    throw error;
  }
}
