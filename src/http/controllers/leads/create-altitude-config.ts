import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { z } from "zod";
import { makeCreateAltitudeConfigUseCase } from "../../../use-cases/factories/make-create-altitude-config-use-case";

export async function createAltitudeConfig(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createAltitudeConfigBodySchema = z.object({
    client_name: z.string(),
    campaign_name: z.string(),
    contact_list: z.string(),
    directory_name: z.string(),
    timezone: z.string(),
    default_status: z.string(),
    uses_dncl: z.boolean(),
  });

  const data = createAltitudeConfigBodySchema.parse(request.body);

  try {
    const createAltitudeConfigUseCase = makeCreateAltitudeConfigUseCase();
    const result = await createAltitudeConfigUseCase.execute(data);

    return reply.status(201).send(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({
      error: `Não foi possível cadastrar o cliente. Contacte o administrador de IT: ${error}`,
    });
  }
}
