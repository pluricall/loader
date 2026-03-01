import { FastifyRequest, FastifyReply } from "fastify";
import { GetRequestIpAndUrl } from "../../../../../shared/utils/get-request-and-url";
import { minisomCorporateSchema } from "../../../schemas/minisom-corporate.schema";
import { makeMinisomCorporateUseCase } from "../../../use-cases/factories/minisom-corporate.factory";

export async function minisomCorporate(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = minisomCorporateSchema.parse(request.body);
    const minisomCorporateFactory = makeMinisomCorporateUseCase();
    const { request_ip, request_url } = GetRequestIpAndUrl(request);

    const result = await minisomCorporateFactory.execute({
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
    console.error("Error in minisomCorporate controller:", error);

    return reply.status(500).send({
      error: "Internal server error",
    });
  }
}
