import { FastifyReply, FastifyRequest } from "fastify";
import { AlreadyExistsError } from "../../../shared/errors/name-already-exists-error";
import { z } from "zod";
import { makeCreateTypUseCase } from "../../../use-cases/factories/make-create-typ-use-case";

export async function createTyp(request: FastifyRequest, reply: FastifyReply) {
  const createBodySchema = z.object({
    name: z.string(),
    separator: z.string(),
    entityName: z.enum([
      "ACTIVITY",
      "CONTACT_PROFILE",
      "CONSENT",
      "DNCL_ENTRY",
      "TABLE_SCHEMA_ENUM_VALUE",
      "WF_PROCESS_INSTANCE",
    ]),
    loadingMode: z.enum(["APPEND", "UPDATE", "APPEND_OR_UPDATE", "REPLACE"]),
    fields: z.array(z.string()),
    fixedFields: z.record(z.string().or(z.number())),
  });

  const data = createBodySchema.parse(request.body);

  try {
    const createTypUseCase = makeCreateTypUseCase();
    await createTypUseCase.execute(data);

    reply.status(201).send();
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
