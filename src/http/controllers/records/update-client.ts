import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { UpdateClientStatusUseCase } from "../../../use-cases/update-client-recordings";

export async function updateClientRecordings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const bodySchema = z.object({
    clientName: z.string().min(1, "Nome do cliente obrigatório"),
  });

  try {
    const { clientName } = bodySchema.parse(request.params);
    const updateClientStatusUseCase = new UpdateClientStatusUseCase();
    await updateClientStatusUseCase.execute(clientName);

    return reply.status(204).send();
  } catch (error: any) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: error.message || "Erro interno" });
  }
}
