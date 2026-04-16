import { FastifyRequest, FastifyReply } from "fastify";
import { makeSendContractsUseCase } from "../../../application/use-cases/factories/agilidade-contracts.factory";
import { sendContractsSchema } from "../../schemas/agilidade-contracts.schema";

export async function agilidadeContractsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = sendContractsSchema.parse(request.body);

  try {
    const useCase = makeSendContractsUseCase();
    await useCase.execute(body);

    return reply.status(200).send({ status: "SUCCESS" });
  } catch (error: any) {
    console.error("Error in sendContractsController:", error);
    throw error;
  }
}
