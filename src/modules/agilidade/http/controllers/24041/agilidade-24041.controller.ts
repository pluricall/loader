import { FastifyRequest, FastifyReply } from "fastify";
import { GetRequestIpAndUrl } from "../../../../../shared/utils/get-request-and-url";
import { extractAllFields } from "../../../utils/extract-fields";
import { agilidade24041Schema } from "../../../schemas/agilidade-24041.schema";
import { UnauthorizedError } from "../../../../../shared/errors/unauthorized-error";
import { makeAgilidade24041UseCase } from "../../../use-cases/factories/agilidade-24041.factory";

export async function agilidade24041(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = request.headers.token?.toString();
    if (!token) {
      return reply.status(403).send({ error: "Missing token" });
    }

    const { request_ip, request_url } = GetRequestIpAndUrl(request);

    let parsedBody: Record<string, any> = {};

    try {
      if (request.body && typeof request.body === "object") {
        const bodyObj = request.body as Record<string, any>;
        const keys = Object.keys(bodyObj);
        if (keys.length === 1) {
          const jsonString = keys[0];
          const innerJsonMatch = jsonString.match(/^\{.*?\}(?=:"")/);

          if (innerJsonMatch) {
            try {
              const cleanJson = innerJsonMatch[0]
                .replace(/\\"/g, '"')
                .replace(/\\n/g, "")
                .replace(/\\r/g, "")
                .replace(/\\t/g, "")
                .replace(/\s+/g, " ")
                .trim();
              parsedBody = JSON.parse(cleanJson);
            } catch (parseError) {
              console.error(
                "Erro no parse do JSON, usando extractAllFields:",
                parseError,
              );
              parsedBody = extractAllFields(jsonString);
            }
          } else {
            parsedBody = extractAllFields(jsonString);
          }
        }
      }
    } catch (error) {
      console.error("Erro no processamento do body:", error);
    }

    if (!parsedBody.nome || !parsedBody.telefone) {
      return reply.status(400).send({
        error: "Campos obrigatórios não encontrados",
        received: request.body,
        parsed: parsedBody,
      });
    }

    Object.keys(parsedBody).forEach((key) => {
      if (typeof parsedBody[key] === "string") {
        parsedBody[key] = parsedBody[key].trim();
      }
    });

    if (parsedBody.telefone) {
      parsedBody.telefone = parsedBody.telefone.replace(/^\s+/, "");
    }

    const body = agilidade24041Schema.parse(parsedBody);

    const agilidade24041UseCase = makeAgilidade24041UseCase();

    const result = await agilidade24041UseCase.execute({
      bodyRequest: body,
      requestIp: request_ip,
      requestUrl: request_url,
      token,
    });

    reply.status(200).send({
      status: result.status,
      status_msg: result.statusMsg,
      gen_id: result.genId,
    });
  } catch (error: any) {
    console.error("Error in agilidade24041 controller:", error);
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ error: error.message });
    }
    return reply.status(500).send({
      error: "Internal Server Error",
    });
  }
}
