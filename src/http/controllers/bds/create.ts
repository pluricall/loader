import { Status, BdType } from "@prisma/client";
import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../../shared/errors/not-found-error";
import { makeCreateBdUseCase } from "../../../use-cases/factories/make-create-bd-use-case";

export async function createBd(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    clientId: z
      .string()
      .uuid({ message: "O ID do Cliente inválido. Deve ser um UUID." }),
  });

  const createBdSchema = z.object({
    type: z.nativeEnum(BdType),
    status: z.nativeEnum(Status),
    user: z.string(),
    bdName: z.string(),
    origin: z.string(),
  });

  const data = createBdSchema.parse(request.body);
  const { clientId } = paramsSchema.parse(request.params);

  try {
    const registerBdsUseCase = makeCreateBdUseCase();
    await registerBdsUseCase.execute(clientId, data);
    return reply.status(201).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({ message: error });
  }
}
