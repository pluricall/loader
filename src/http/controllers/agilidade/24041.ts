// src/http/controllers/minisom/legacy-controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { AltitudeApiError } from "../../../use-cases/errors/altitude-error";
import { AltitudeAuthError } from "../../../use-cases/errors/altitude-auth-error";
import { AlreadyExistsError } from "../../../use-cases/errors/name-already-exists-error";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";
import { makeAgilidade24041UseCase } from "../../../use-cases/agilidade/factories/make-24041-use-case";
import { UnauthorizedError } from "../../../use-cases/errors/unauthorized-error";

const agilidade24041Schema = z.object({
  lead_id: z.string().optional(),
  telefone: z.string().optional(),
  email: z.string().optional(),
  nome: z.string().optional(),
  localidade: z.string().optional(),
  created_date: z.string().optional(),
  ad_id: z.string().optional(),
  adset_id: z.string().optional(),
  campaign_id: z.string().optional(),
  ad_name: z.string().optional(),
  campaign_name: z.string().optional(),
  adset_name: z.string().optional(),
  form_id: z.string().optional(),
});

export async function agilidade24041(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const token = request.headers.token?.toString();
    const formData = request.body as Record<string, any>;

    if (!token) {
      return reply.status(403).send({ error: "Missing token" });
    }
    const forwarded = request.headers["x-forwarded-for"];
    const request_ip = forwarded
      ? forwarded.toString().split(",")[0].trim()
      : request.ip;
    const request_url = `${request.protocol}://${request.hostname}${request.raw.url}`;

    const body = agilidade24041Schema.parse(request.body);
    const agilidade24041UseCase = makeAgilidade24041UseCase();
    const useCaseRequest = {
      ...body,
      request_ip,
      request_url,
      token,
      formdata: formData,
    };

    const result = await agilidade24041UseCase.execute(useCaseRequest);

    reply.status(200).send(result);

    agilidade24041UseCase.processAsync({
      ...useCaseRequest,
      gen_id: result.gen_id,
      token,
    });
  } catch (error: any) {
    if (error instanceof AltitudeApiError) {
      return reply.status(400).send({ error: error.message });
    } else if (error instanceof AltitudeAuthError) {
      return reply.status(401).send({ error: error.message });
    } else if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ error: error.message });
    } else if (error instanceof NotFoundError) {
      return reply.status(404).send({ error: error.message });
    } else if (error instanceof UnauthorizedError) {
      return reply.status(403).send({ error: error.message });
    }

    return reply.status(500).send({
      message: error.message,
    });
  }
}
