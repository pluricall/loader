import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Frequency, Status } from "@prisma/client";
import { AlreadyExistsError } from "../../../use-cases/errors/name-already-exists-error";
import { makeUpdateClientUseCase } from "../../../use-cases/factories/make-update-client-use-case";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";

export async function updateClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const updateBodySchema = z.object({
    clientName: z.string().optional(),
    status: z.nativeEnum(Status).optional(),
    contactDpo: z.string().nullable().optional(),
    contactExDto: z.string().nullable().optional(),
    infoExDto: z.string().nullable().optional(),
    owner: z.string().optional(),
    ftpPath: z.string().optional(),
    recordingDevolution: z.nativeEnum(Frequency).optional().optional(),
  });

  const updateParamsSchema = z.object({
    id: z.string().uuid({ message: "ID inválido. Deve ser um UUID." }),
  });

  const { id } = updateParamsSchema.parse(request.params);
  const data = updateBodySchema.parse(request.body);

  try {
    const updateclientsUseCase = makeUpdateClientUseCase();
    await updateclientsUseCase.execute(id, { ...data });

    return reply.status(200).send();
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
