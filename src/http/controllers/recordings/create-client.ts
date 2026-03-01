import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AlreadyExistsError } from "../../../shared/errors/name-already-exists-error";
import { CreateClientRecordingUseCase } from "../../../use-cases/recordings/create-client-recording";

export async function createClientRecordings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const schema = z.object({
    clientName: z.string().min(3),
    ctName: z.string().min(3),
    percentDifferentsResult: z.number().min(0).max(100),
    startTime: z.string().min(1),
    siteId: z.string().nonempty(),
    driveId: z.string().nonempty(),
    folderPath: z.string().optional(),
    status: z.enum(["ACTIVO", "INACTIVO"]),
    isBd: z.boolean().default(false),
    isHistorical: z.boolean().default(false),
    resultsNotInFivePercent: z.string(),
    email: z.string().email(),
    password: z.string().min(3),
  });

  const data = schema.parse(request.body);

  try {
    const createClientRecordingUseCase = new CreateClientRecordingUseCase();
    const created = await createClientRecordingUseCase.execute(data);
    return reply.status(201).send(created);
  } catch (error) {
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ message: error.message });
    }
    return reply.status(500).send({ message: error });
  }
}
