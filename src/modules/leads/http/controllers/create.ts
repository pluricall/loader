import { FastifyRequest, FastifyReply } from "fastify";
import { makeCreateLeadConfigUseCase } from "../../application/factories/make-create-use-case";
import { z } from "zod";

export async function createLeadConfigController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const createLeadConfigSchema = z.object({
      lead: z.object({
        client_name: z.string(),
        environment: z.enum(["cloud", "onprem", "pre"]),
        campaign_name: z.string(),
        contact_list: z.string(),
        directory_name: z.string(),
        timezone: z.string(),
        default_status: z.string(),
        uses_dncl: z.boolean(),
      }),
      mapping: z.array(
        z.object({
          source_field: z.string(),
          altitude_field: z.string(),
          is_required: z.boolean(),
        }),
      ),
    });

    const parsed = createLeadConfigSchema.parse(request.body);

    const createLeadConfigUseCase = makeCreateLeadConfigUseCase();

    const result = await createLeadConfigUseCase.execute(parsed);

    return reply.status(201).send(result);
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return reply.status(400).send({ errors: error.errors });
    }
    console.error(error);
    return reply.status(500).send({ message: error.message });
  }
}
