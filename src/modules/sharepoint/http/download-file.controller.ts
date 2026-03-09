import { FastifyReply, FastifyRequest } from "fastify";
import { DownloadFileUseCase } from "../application/use-cases/download-file.use-case";
import { SharepointRepository } from "../infra/repositories/sharepoint-repository";

export async function downloadFileController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { driveId, filePath } = request.query as {
      driveId: string;
      filePath: string;
    };

    const useCase = new DownloadFileUseCase(new SharepointRepository());
    const buffer = await useCase.execute(driveId, filePath);

    return reply
      .header("Content-Type", "application/octet-stream")
      .header(
        "Content-Disposition",
        `attachment; filename="${filePath.split("/").pop()}"`,
      )
      .send(buffer);
  } catch (err: any) {
    const status = err.message.includes("required") ? 400 : 500;
    return reply.status(status).send({ error: err.message });
  }
}
