import { FastifyReply, FastifyRequest } from "fastify";
import client from "../../../shared/infra/db/sharePointConnection";

export async function getSharepointDrives(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const siteId = (request.query as any).siteId;
    if (!siteId) {
      return reply.status(400).send({ error: "siteId is required" });
    }

    const res = await client.api(`/sites/${siteId}/drives`).get();
    const drives = res.value.map((d: any) => ({ id: d.id, name: d.name }));
    return reply.send(drives);
  } catch (err: any) {
    return reply.status(500).send({ error: err.message });
  }
}
