import { Status, BdType } from "@prisma/client";
import { z } from "zod";
import { FastifyReply, FastifyRequest } from "fastify";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { makeUpdateBdUseCase } from "../../../use-cases/factories/make-update-bd-use-case";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";

export async function updateBd(request: FastifyRequest, reply: FastifyReply) {
  const paramsSchema = z.object({
    clientId: z
      .string()
      .uuid({ message: "O ID do Cliente inválido. Deve ser um UUID." }),
    bdId: z
      .string()
      .uuid({ message: "O ID da BD inválido. Deve ser um UUID." }),
  });

  const createBdSchema = z.object({
    type: z.nativeEnum(BdType).optional(),
    status: z.nativeEnum(Status).optional(),
    user: z.string().optional(),
    bdName: z.string().optional(),
    origin: z.string().optional(),
  });

  const data = createBdSchema.parse(request.body);
  const { clientId, bdId } = paramsSchema.parse(request.params);

  try {
    const updateBdUseCase = makeUpdateBdUseCase();
    await updateBdUseCase.execute({
      bdId,
      clientId,
      data,
    });
    return reply.status(200).send();
  } catch (error) {
    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ message: error.message });
    }
    return reply.status(500).send({ message: error });
  }
}
