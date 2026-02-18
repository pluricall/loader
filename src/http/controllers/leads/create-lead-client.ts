import { FastifyReply, FastifyRequest } from "fastify";
import { AlreadyExistsError } from "../../../use-cases/errors/name-already-exists-error";
import { z } from "zod";
import { makeCreateLeadClientUseCase } from "../../../use-cases/factories/make-create-lead-client-use-case";

export async function createLeadClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createBodySchema = z.object({
    clientName: z.string(),
    environment: z.enum(["cloud", "onprem", "pre"]),
  });

  const data = createBodySchema.parse(request.body);

  try {
    const createLeadClientUseCase = makeCreateLeadClientUseCase();
    const { client_name, api_key } =
      await createLeadClientUseCase.execute(data);

    return reply.status(201).send({ client_name, api_key });
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    return reply.status(500).send({
      error: `Não foi possível cadastrar o cliente. Contacte o administrador de IT: ${error}`,
    });
  }
}
