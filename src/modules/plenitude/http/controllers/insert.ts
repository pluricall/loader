import { FastifyReply, FastifyRequest } from "fastify";
import { makePlenitudeInsert } from "../../application/factories/make-plenitude-insert";
import { plenitudeBodySchema } from "../schemas/plenitude-schema";
import { PlenitudeLoginError } from "../../domain/errors/plenitude-login-error";

export async function plenitudeInsert(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { digitalData } = plenitudeBodySchema.parse(request.body);

    const plenitudeInsert = makePlenitudeInsert();
    const result = await plenitudeInsert.execute(digitalData);

    return reply.send(result);
  } catch (error: any) {
    if (error instanceof PlenitudeLoginError) {
      return reply.status(400).send({ error: error.message });
    }
    throw error;
  }
}
