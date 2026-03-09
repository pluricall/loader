// infra/http/controllers/getFoldersController.ts
import { FastifyReply, FastifyRequest } from "fastify";
import { SharepointRepository } from "../infra/repositories/sharepoint-repository";
import { GetFoldersUseCase } from "../application/use-cases/get-folders.use-case";

export async function getFoldersController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { driveId, folderPath } = request.query as {
      driveId: string;
      folderPath?: string;
    };

    const useCase = new GetFoldersUseCase(new SharepointRepository());
    const folders = await useCase.execute(driveId, folderPath);

    return reply.send(folders);
  } catch (err: any) {
    const status = err.message.includes("required") ? 400 : 500;
    return reply.status(status).send({ error: err.message });
  }
}
