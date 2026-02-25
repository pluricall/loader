import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AltitudeApiError } from "../../../use-cases/errors/altitude-error";
import { AltitudeAuthError } from "../../../use-cases/errors/altitude-auth-error";
import { makeMinisomCorporateUseCase } from "../../../use-cases/minisom/factories/make-corporate-use-case";

export const getLeadCorporate = z.object({
  adobe_campaign_code: z.string(),
  email: z.string().optional(),
  form_title: z.string().optional(),
  language: z.string().optional(),
  marketing_consensus_flag: z.string().optional(),
  name: z.string().optional(),
  surname: z.string().optional(),
  phone_number: z.string(),
  privacy_consensus_flag: z.string().optional(),
  address: z.string().optional(),
  free_message: z.string().optional(),
  type_of_request: z.string().optional(),
});

export async function minisomCorporate(
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

    const {
      adobe_campaign_code,
      email,
      form_title,
      marketing_consensus_flag,
      name,
      surname,
      phone_number,
      privacy_consensus_flag,
      address,
      free_message,
      type_of_request,
    } = getLeadCorporate.parse(rawBody);

    const minisomCorporateUseCase = makeMinisomCorporateUseCase();

    const result = await minisomCorporateUseCase.execute({
      adobe_campaign_code,
      email: email ?? "",
      form_title: form_title ?? "",
      marketing_consensus_flag: marketing_consensus_flag ?? "",
      name: name || "",
      surname: surname || "",
      phone_number,
      privacy_consensus_flag: privacy_consensus_flag || "",
      address,
      free_message,
      type_of_request,
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
    }

    return reply.status(500).send({
      message: error.message,
    });
  }
}
