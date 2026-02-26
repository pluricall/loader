// src/http/controllers/minisom/legacy-controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeAgilidade24041UseCase } from "../../../use-cases/agilidade/factories/make-24041-use-case";
import { extractAllFields } from "./extract-fields";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";

const agilidade24041Schema = z.object({
  nome: z.string(),
  telefone: z.string(),
  lead_id: z.string().optional(),
  email: z.string().optional(),
  localidade: z.string().optional(),
  created_date: z.string().optional(),
  ad_id: z.string().optional(),
  adset_id: z.string().optional(),
  campaign_id: z.string().optional(),
  ad_name: z.string().optional(),
  campaign_name: z.string().optional(),
  adset_name: z.string().optional(),
  form_id: z.string().optional(),
  dataEntrada: z.string().optional(),
  dataPedido: z.string().optional(),
  marca: z.string().optional(),
  horario: z.string().optional(),
  dist_id: z.string().optional(),
  posted_date: z.string().optional(),
  city: z.string().optional(),
});

export async function agilidade24041(req: FastifyRequest, reply: FastifyReply) {
  try {
    const token = req.headers.token?.toString();
    if (!token) return reply.status(403).send({ error: "Missing token" });

    const forwarded = req.headers["x-forwarded-for"];
    const request_ip = forwarded
      ? forwarded.toString().split(",")[0].trim()
      : req.ip;
    const request_url = `${req.protocol}://${req.hostname}${req.raw.url}`;

    let parsedBody: Record<string, any> = {};

    try {
      if (req.body && typeof req.body === "object") {
        const bodyObj = req.body as Record<string, any>;
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
      console.error("Campos obrigatórios ausentes");
      console.error("Body recebido:", req.body);
      console.error("ParsedBody resultante:", parsedBody);

      return reply.status(400).send({
        error: "Campos obrigatórios não encontrados",
        received: req.body,
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

    const {
      request,
      contactList,
      gen_id,
      campaignName,
      normalizedPhoneNumber,
    } = await agilidade24041UseCase.execute({
      request: body,
      request_ip,
      request_url,
      token,
      formdata: parsedBody,
    });

    reply.status(200).send({ status: "OK", gen_id });

    agilidade24041UseCase.uploadContact({
      campaignName,
      contactList,
      gen_id,
      phoneNumber: normalizedPhoneNumber,
      nome: request.nome,
      email: request.email,
      lead_id: request.lead_id,
      localidade: request.localidade,
      ad_id: request.ad_id,
      adset_id: request.adset_id,
      campaign_id: request.campaign_id,
      adset_name: request.adset_name,
      created_date: request.created_date,
      ad_name: request.ad_name,
      campaign_name: request.campaign_name,
      form_id: request.form_id,
    });
  } catch (error: any) {
    console.error("Error in agilidade24041 controller:", error);
    if (error instanceof UnauthorizedError) {
      return reply.status(401).send({ error: error.message });
    }
    return reply.status(500).send({
      error: "Internal Server Error",
      message:
        process.env.NODE_ENV === "development" ? error.message : undefined,
    });
  }
}
