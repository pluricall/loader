import { FastifyReply, FastifyRequest } from "fastify";
import { MssqlIberdrolaRepository } from "../../../repositories/mssql/mssql-iberdrola-repository";
import { IberdrolaWebhookSmsUseCase } from "../../../use-cases/iberdrola/webhook-sms";
import { WebhookSmsResponse } from "../../../repositories/iberdrola-repository";

export async function iberdrolaSms(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const repository = new MssqlIberdrolaRepository();
    const iberdrolaWebhookSmsUseCase = new IberdrolaWebhookSmsUseCase(
      repository,
    );
    const data = request.body as WebhookSmsResponse;

    await iberdrolaWebhookSmsUseCase.execute(data);
    return reply.status(200).send({ success: true });
  } catch (err: any) {
    console.error("Erro ao processar SMS webhook:", err);
    return reply.status(500).send({ success: false, error: err.message });
  }
}
