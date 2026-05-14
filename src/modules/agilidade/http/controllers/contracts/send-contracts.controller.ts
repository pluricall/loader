import { FastifyRequest, FastifyReply } from "fastify";
import { makeSendContractsUseCase } from "../../../application/use-cases/factories/agilidade-contracts.factory";
import { sendContractSchema } from "../../schemas/agilidade-contracts.schema";

export async function agilidadeContractsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const { date } = sendContractSchema.parse(request.query);

  const useCase = makeSendContractsUseCase();
  const result = await useCase.executeBatch({ date });

  const hasErrors = result.failed > 0;

  return reply.status(hasErrors ? 207 : 200).send({
    status: hasErrors ? (result.success > 0 ? "PARTIAL" : "ERROR") : "SUCCESS",
    ...result,
  });
}
