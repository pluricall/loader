import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateLeadConfigUseCase } from "../../application/factories/make-create-use-case";
import { z } from "zod";
import { ValidationError } from "../../../../use-cases/errors/validation-error";
import { AlreadyExistsError } from "../../../../use-cases/errors/name-already-exists-error";

export async function createLeadConfigController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const createLeadConfigSchema = z.object({
    lead: z.object({
      clientName: z.string({
        required_error: "Client name is required.",
        invalid_type_error: "Client name must be a string",
      }),
      environment: z.enum(["cloud", "onprem", "pre"], {
        required_error: "Environment is required",
      }),
      campaignName: z.string({ required_error: "Campaign Name is required." }),
      contactList: z.string({ required_error: "Contact List is required." }),
      directoryName: z.string({
        required_error: "Directory Name is required.",
      }),
      timezone: z.string({ required_error: "Timezone is required." }),
      defaultStatus: z.string({
        required_error: "Default Status is required.",
      }),
      usesDncl: z.boolean({ required_error: "Uses DNCL is required" }),
    }),
    mapping: z.array(
      z.object({
        sourceField: z.string(),
        altitudeField: z.string(),
        isRequired: z.boolean(),
      }),
    ),
  });

  const parsed = createLeadConfigSchema.parse(request.body);

  try {
    const createLeadConfigUseCase = makeCreateLeadConfigUseCase();

    const result = await createLeadConfigUseCase.execute({
      lead: {
        client_name: parsed.lead.clientName,
        environment: parsed.lead.environment,
        campaign_name: parsed.lead.campaignName,
        contact_list: parsed.lead.contactList,
        directory_name: parsed.lead.directoryName,
        timezone: parsed.lead.timezone,
        default_status: parsed.lead.defaultStatus,
        uses_dncl: parsed.lead.usesDncl,
      },
      mapping: parsed.mapping.map((map) => ({
        source_field: map.sourceField,
        altitude_field: map.altitudeField,
        is_required: map.isRequired,
      })),
    });

    return reply.status(201).send(result);
  } catch (err) {
    if (err instanceof ValidationError) {
      return reply.status(400).send({ error: err.message });
    } else if (err instanceof AlreadyExistsError) {
      return reply.status(409).send({ error: err.message });
    }
    return reply.status(500).send({ error: "Create config internal error" });
  }
}
