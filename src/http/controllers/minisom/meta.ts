import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeMinisomMetaUseCase } from "../../../use-cases/minisom/factories/make-meta-use-case";
import { AltitudeApiError } from "../../../use-cases/errors/altitude-error";
import { AltitudeAuthError } from "../../../use-cases/errors/altitude-auth-error";
import { AlreadyExistsError } from "../../../use-cases/errors/name-already-exists-error";
import { NotFoundError } from "../../../use-cases/errors/not-found-error";

export const getLeadMeta = z.object({
  phone_number: z.string(),
  lead_id: z.string(),
  form_id: z.string(),
  email: z.string(),
  full_name: z.string(),
});

export async function minisomMeta(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const forwarded = request.headers["x-forwarded-for"];

    const request_ip = forwarded
      ? forwarded.toString().split(",")[0].trim()
      : request.ip;

    const request_url = `${request.protocol}://${request.hostname}${request.raw.url}`;
    const rawBody = request.body as Record<string, any>;

    const { lead_id, form_id, email, full_name, phone_number } =
      getLeadMeta.parse(rawBody);

    const minisomMetaUseCase = makeMinisomMetaUseCase();

    const result = await minisomMetaUseCase.execute({
      lead_id,
      form_id,
      email,
      full_name,
      phone_number,
      formData: rawBody,
      request_ip,
      request_url,
    });
    return reply.status(200).send(result);
  } catch (error: any) {
    console.error(error);

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
