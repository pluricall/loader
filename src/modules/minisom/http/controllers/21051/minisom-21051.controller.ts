import { FastifyRequest, FastifyReply } from "fastify";
import { GetRequestIpAndUrl } from "../../../../../utils/get-request-and-url";
import { AlreadyExistsError } from "../../../../../use-cases/errors/name-already-exists-error";
import { minisom21051Schema } from "../../../schemas/minisom-21051.schema";
import { Minisom21051Factory } from "../../../use-cases/21051/minisom-21051.factory";

export async function minisom21051(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    console.log("TYPE:", typeof request.body);
    console.log("IS BUFFER:", Buffer.isBuffer(request.body));
    console.log("BODY RAW:", request.body);
    const body = minisom21051Schema.parse(request.body);
    const minisom21051Factory = Minisom21051Factory();
    const { request_ip, request_url } = GetRequestIpAndUrl(request);

    const result = await minisom21051Factory.execute({
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
    console.error("Error in minisom21051 controller:", error);
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ error: error.message });
    }

    return reply.status(500).send({
      error: "Internal server error",
    });
  }
}
