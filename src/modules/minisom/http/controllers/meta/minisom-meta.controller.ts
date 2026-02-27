import { FastifyReply, FastifyRequest } from "fastify";
import { minisomMetaSchema } from "../../../schemas/minisom-meta.schema";
import { MinisomMetaFactory } from "../../../use-cases/meta/minisom-meta-factory";
import { GetRequestIpAndUrl } from "../../../../../utils/get-request-and-url";
import { AlreadyExistsError } from "../../../../../use-cases/errors/name-already-exists-error";
import { NotFoundError } from "../../../../../use-cases/errors/not-found-error";

export async function minisomMeta(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const body = minisomMetaSchema.parse(request.body);
    const minisomMetaFactory = MinisomMetaFactory();
    const { request_ip, request_url } = GetRequestIpAndUrl(request);

    await minisomMetaFactory.execute({
      bodyRequest: body,
      requestUrl: request_url,
      requestIp: request_ip,
    });

    reply.status(200).send();
  } catch (error: any) {
    console.error("Error in minisomMeta controller:", error);
    if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ error: error.message });
    } else if (error instanceof NotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    return reply.status(500).send({
      error: "Internal server error",
    });
  }
}
