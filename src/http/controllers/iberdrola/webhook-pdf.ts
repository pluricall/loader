import { FastifyReply, FastifyRequest } from "fastify";
import { MssqlIberdrolaRepository } from "../../../repositories/mssql/mssql-iberdrola-repository";
import { WebhookPdfResponse } from "../../../repositories/iberdrola-repository";
import { IberdrolaWebhookPdfUseCase } from "../../../use-cases/iberdrola/webhook-pdf";

export async function iberdrolaPdf(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const repository = new MssqlIberdrolaRepository();
    const iberdrolaWebhookPdfUseCase = new IberdrolaWebhookPdfUseCase(
      repository,
    );
    const data = request.body as WebhookPdfResponse;

    await iberdrolaWebhookPdfUseCase.execute(data);
    return reply.status(200).send({ success: true });
  } catch (err: any) {
    console.error("Erro ao processar Pdf webhook:", err);
    return reply.status(500).send({ success: false, error: err.message });
  }
}
