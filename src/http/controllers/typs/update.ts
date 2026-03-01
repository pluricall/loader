import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { NotFoundError } from "../../../shared/errors/not-found-error";
import { AlreadyExistsError } from "../../../shared/errors/name-already-exists-error";
import { makeUpdateTypUseCase } from "../../../use-cases/factories/make-update-typ-use-case";
import { EntityNameEnum, LoadingModeEnum } from "@prisma/client";

export async function updateTyp(request: FastifyRequest, reply: FastifyReply) {
  const updateParamsSchema = z.object({
    id: z.string().uuid(),
  });

  const updateBodySchema = z.object({
    name: z.string().optional(),
    separator: z.string().optional(),
    entityName: z.nativeEnum(EntityNameEnum).optional(),
    loadingMode: z.nativeEnum(LoadingModeEnum).optional(),
    fields: z.array(z.string()).optional(),
    fixedFields: z.record(z.string().or(z.number())).optional(),
  });

  const { id } = updateParamsSchema.parse(request.params);
  const data = updateBodySchema.parse(request.body);

  try {
    const updateTypUseCase = makeUpdateTypUseCase();
    await updateTypUseCase.execute(id, { ...data });
    reply.status(200).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
