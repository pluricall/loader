import { FastifyReply, FastifyRequest } from "fastify";
import { GetClientRecordingsUseCase } from "../../../use-cases/recordings/get-client-recordings";

export async function getClientsRecordings(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const getClientRecordingsUseCase = new GetClientRecordingsUseCase();
    const { clientRecord } = await getClientRecordingsUseCase.execute();

    return reply.status(200).send({ clientRecord });
  } catch (error) {
    return reply.status(500).send("Internal server error");
  }
}
