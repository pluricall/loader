import { FastifyReply, FastifyRequest } from "fastify";
import client from "../../../db/sharePointConnection";

export async function getSharepointSites(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const res = await client.api("/sites?search=*").get();

    const sites = res.value
      .filter((s: any) => s.displayName.toLowerCase().startsWith("cliente"))
      .map((s: any) => ({ id: s.id, displayName: s.displayName }));

    return reply.send(sites);
  } catch (err: any) {
    return reply.status(500).send({ error: "Error sharepoint sites" });
  }
}
