import { FastifyRequest, FastifyReply } from "fastify";
import { GetRequestIpAndUrl } from "../../../../../utils/get-request-and-url";
import { AlreadyExistsError } from "../../../../../use-cases/errors/name-already-exists-error";
import { minisom21121Schema } from "../../../schemas/minisom-21121.schema";
import { Minisom21121Factory } from "../../../use-cases/21121/minisom-21121.factory";

export async function minisom21121(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = minisom21121Schema.parse(request.body);
    const minisom21121Factory = Minisom21121Factory();
    const { request_ip, request_url } = GetRequestIpAndUrl(request);

    const result = await minisom21121Factory.execute({
      bodyRequest: body,
      requestIp: request_ip,
      requestUrl: request_url,
    });

    reply.status(200).send({
      status: result.status,
      status_msg: result.statusMsg,
      gen_id: result.genId,
    });
  } catch (error: any) {
    console.error("Error in minisom21121 controller:", error);
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ error: error.message });
    }

    return reply.status(500).send({
      error: "Internal server error",
    });
  }
}
