// src/http/controllers/minisom/legacy-controller.ts
import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { makeMinisom21121UseCase } from "../../../use-cases/minisom/factories/make-21121-use-case";
import { AltitudeApiError } from "../../../use-cases/errors/altitude-error";
import { AltitudeAuthError } from "../../../use-cases/errors/altitude-auth-error";
import { AlreadyExistsError } from "../../../use-cases/errors/name-already-exists-error";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";

const minisomLegacySchema = z.object({
  auth_key: z.string(),
  lead_id: z.string().or(z.number()),
  phone_number: z.string(),
  email: z.string(),
  first_name: z.string(),
  bd: z.string(),
  form_id: z.string().or(z.number()).optional(),
  last_name: z.any().optional(),
  campaign: z.any().optional(),
  birth_date: z.any().optional(),
  created_date: z.any().optional(),
  posted_date: z.any().optional(),
  marketing: z.any().optional(),
  privacy: z.any().optional(),
  utm_source: z.any().optional(),
  utm_code: z.any().optional(),
  partner_id: z.any().optional(),
  additional1: z.any().optional(),
  additional2: z.any().optional(),
  additional3: z.any().optional(),
  address: z.any().optional(),
  city: z.any().optional(),
  post_code: z.any().optional(),
  site_id: z.any().optional(),
  dif_auditiva: z.any().optional(),
});

export async function minisom21121(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const forwarded = request.headers["x-forwarded-for"];

    const request_ip = forwarded
      ? forwarded.toString().split(",")[0].trim()
      : request.ip;

    const request_url = `${request.protocol}://${request.hostname}${request.raw.url}`;
    const body = minisomLegacySchema.parse(request.body);
    const minisom21121UseCase = makeMinisom21121UseCase();
    const result = await minisom21121UseCase.execute({
      ...body,
      request_ip,
      request_url,
    });
    return reply.status(200).send(result);
  } catch (error: any) {
    if (error instanceof AltitudeApiError) {
      return reply.status(400).send({ error: error.message });
    } else if (error instanceof AltitudeAuthError) {
      return reply.status(401).send({ error: error.message });
    } else if (error instanceof AlreadyExistsError) {
      return reply.status(409).send({ error: error.message });
    } else if (error instanceof NotFoundError) {
      return reply.status(404).send({ error: error.message });
    }

    return reply.status(500).send({
      message: error.message,
    });
  }
}
