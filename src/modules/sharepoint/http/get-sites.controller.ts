import { FastifyReply, FastifyRequest } from "fastify";
import { SharepointRepository } from "../infra/repositories/sharepoint-repository";
import { GetSitesUseCase } from "../application/use-cases/get-sites.use-case";

export async function getSitesController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const useCase = new GetSitesUseCase(new SharepointRepository());
  const sites = await useCase.execute();

  return reply.send(sites);
}
