import { FastifyReply, FastifyRequest } from "fastify";
import { MssqlIberdrolaRepository } from "../../repositories/mssql-iberdrola.repository";
import { IberdrolaWebhookPdfUseCase } from "../../use-cases/webhook-pdf";
import { WebhookPdfResponse } from "../../repositories/iberdrola.repository";

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
