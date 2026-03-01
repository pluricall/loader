import { FastifyReply, FastifyRequest } from "fastify";
import client from "../../../shared/infra/db/sharePointConnection";

export async function getSharepointFolders(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const driveId = (request.query as any).driveId;
    if (!driveId) {
      return reply.status(400).send({ error: "driveId is required" });
    }

    const folderPath = (request.query as any).folderPath || "";
    const apiPath = folderPath
      ? `/drives/${driveId}/root:/${folderPath}:/children`
      : `/drives/${driveId}/root/children`;

    const res = await client.api(apiPath).get();
    const folders = res.value
      .filter((item: any) => item.folder)
      .map((folder: any) => ({
        name: folder.name,
        path: folderPath ? `${folderPath}/${folder.name}` : folder.name,
        hasChildren: folder.folder.childCount > 0,
      }));

    return reply.send(folders);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}
