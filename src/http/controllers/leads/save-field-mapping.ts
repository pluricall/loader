import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { ValidationError } from "../../../use-cases/errors/validation-error";
import { makeSaveFieldMappingUseCase } from "../../../use-cases/factories/make-save-field-mapping-use-case";

export async function saveFieldMapping(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const fieldMappingBodySchema = z.array(
    z.object({
      client_name: z.string(),
      source_field: z.string(),
      altitude_field: z.string(),
      is_required: z.boolean(),
    }),
  );

  const data = fieldMappingBodySchema.parse(request.body);

  try {
    const createLeadClientUseCase = makeSaveFieldMappingUseCase();
    const result = await createLeadClientUseCase.execute(data);

    return reply.status(201).send(result);
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    } else if (error instanceof ValidationError) {
      return reply.status(400).send({ message: error.message });
    }

    return reply.status(500).send({
      error: `Não foi possível criar o mapping. Contacte o administrador de IT: ${error}`,
    });
  }
}
