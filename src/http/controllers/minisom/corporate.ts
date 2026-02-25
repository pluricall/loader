import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { AltitudeApiError } from "../../../use-cases/errors/altitude-error";
import { AltitudeAuthError } from "../../../use-cases/errors/altitude-auth-error";
import { makeMinisomCorporateUseCase } from "../../../use-cases/minisom/factories/make-corporate-use-case";

export const minisomCorporateSchema = z.object({
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

    const body = minisomCorporateSchema.parse(rawBody);

    const minisomCorporateUseCase = makeMinisomCorporateUseCase();

    const useCaseRequest = {
      ...body,
      request_ip,
      request_url,
    };

    const result = await minisomCorporateUseCase.execute({
      adobe_campaign_code: body.adobe_campaign_code,
      email: body.email ?? "",
      form_title: body.form_title ?? "",
      marketing_consensus_flag: body.marketing_consensus_flag ?? "",
      name: body.name || "",
      surname: body.surname || "",
      phone_number: body.phone_number,
      privacy_consensus_flag: body.privacy_consensus_flag || "",
      address: body.address || "",
      free_message: body.free_message || "",
      type_of_request: body.type_of_request || "",
      formData: rawBody,
      request_ip,
      request_url,
    });

    reply.status(200).send(result);

    minisomCorporateUseCase.processAsync({
      ...useCaseRequest,
      gen_id: result.gen_id,
    });
  } catch (error: any) {
    console.error(error);
    if (error instanceof AltitudeApiError) {
      return reply.status(400).send({ error: error.message });
    } else if (error instanceof AltitudeAuthError) {
      return reply.status(401).send({ error: error.message });
    }

    return reply.status(500).send({ message: error.message });
  }
}
