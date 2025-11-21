import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { DownloadRecordingsUseCase } from "../../../use-cases/download-recordings";

export async function downloadRecordingsController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const getRecordsSchema = z.object({
    campaignName: z.string(),
    day: z.string(),
    percentDifferentsResult: z.number(),
    driveId: z.string(),
    folderPath: z.string(),
    isBd: z.boolean(),
    isHistorical: z.boolean(),
    resultsNotInFivePercent: z.string(),
  });

  const data = getRecordsSchema.parse(request.body);

  try {
    const downloadRecordingsUseCase = new DownloadRecordingsUseCase();
    const recordings = await downloadRecordingsUseCase.execute(data);

    return reply.status(200).send(recordings);
  } catch (error) {
    console.error(error);
    return reply.status(500).send({ message: "Internal server error" });
  }
}
