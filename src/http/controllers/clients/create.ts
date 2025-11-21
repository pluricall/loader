import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { Frequency, Status } from "@prisma/client";
import { AlreadyExistsError } from "../../../use-cases/errors/name-already-exists-error";
import { makeCreateClientUseCase } from "../../../use-cases/factories/make-create-client-use-case";

export async function createClient(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createBodySchema = z.object({
    clientName: z.string(),
    status: z.nativeEnum(Status),
    contactDpo: z.string().nullable().optional(),
    contactExDto: z.string().nullable().optional(),
    infoExDto: z.string().nullable().optional(),
    owner: z.string(),
    ftpPath: z.string(),
    recordingDevolution: z.nativeEnum(Frequency).optional(),
  });

  const data = createBodySchema.parse(request.body);

  try {
    const createclientsUseCase = makeCreateClientUseCase();
    await createclientsUseCase.execute(data);

    return reply.status(201).send();
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    return reply.status(500).send();
  }
}
