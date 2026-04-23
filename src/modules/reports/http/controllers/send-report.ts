import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeSendReportUseCase } from "../../use-cases/factories/make-send-report";

const schema = z.object({
  clientName: z.string().min(1),
  fileName: z.string().min(1),
  fileBase64: z.string().min(1),
});

export async function sendReportController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const data = schema.parse(request.body);

  try {
    const useCase = makeSendReportUseCase();
    const fileBuffer = Buffer.from(data.fileBase64, "base64");

    await useCase.execute({
      clientName: data.clientName,
      fileName: data.fileName,
      fileBuffer,
    });

    return reply.status(200).send({
      message: "Report enviado com sucesso",
    });
  } catch (error) {
    console.error("SEND REPORT ERROR:", error);

    return reply.status(500).send({
      message: "Erro ao enviar relatório",
    });
  }
}
