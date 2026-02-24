import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { SenderRegisteredIberdrolaSmsUseCase } from "../../../use-cases/iberdrola/sender-sms";
import { MssqlIberdrolaRepository } from "../../../repositories/mssql/mssql-iberdrola-repository";

export const sendSmsSchema = z.object({
  phoneNumber: z
    .string()
    .regex(
      /^\+[1-9]\d{7,14}$/,
      "Número deve estar no formato E.164 (+351912345678)",
    ),
  message: z.string().min(1, "Mensagem obrigatória"),
  easycode: z.string().min(1, "ID do contrato obrigatório"),
  campaign: z.string(),
});

export async function iberdrolaSenderSms(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { message, phoneNumber, easycode, campaign } = sendSmsSchema.parse(
      request.body,
    );
    const iberdrolaRepository = new MssqlIberdrolaRepository();
    const senderRegisteredIberdrolaSmsUseCase =
      new SenderRegisteredIberdrolaSmsUseCase(iberdrolaRepository);
    const response = await senderRegisteredIberdrolaSmsUseCase.execute({
      phoneNumber,
      message,
      easycode,
      campaign,
      responseStatus: "PENDING",
    });

    return reply.send(response);
  } catch (error: any) {
    if (error.response) {
      return reply.status(error.response.status || 400).send({
        error: "Erro na API Lleida",
        details: error.response.data,
      });
    }
    return reply
      .status(500)
      .send({ error: "Erro interno", details: error.message });
  }
}
