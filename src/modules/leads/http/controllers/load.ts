import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeLoadLeadUseCase } from "../../application/factories/make-load-use-case";
import { AltitudeApiError } from "../../../../use-cases/errors/altitude-error";
import { NotFoundError } from "../../../../use-cases/errors/not-found-error";

export async function loadLeadController(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const schema = z.object({
      leads: z.array(z.record(z.any())).min(1, "At least one lead is required"),
    });

    const leads = schema.parse(request.body).leads;
    const client = (request as any).client;

    const loadLeadsUseCase = makeLoadLeadUseCase();
    const results = await loadLeadsUseCase.execute(client, leads);
    const errors = results
      .filter((r) => !r.success)
      .map((r) => ({ lead: r.lead, error: r.error }));

    return reply.status(200).send({
      total: results.length,
      success: results.filter((r) => r.success).length,
      failed: errors.length,
      errors,
    });
  } catch (error) {
    if (error instanceof AltitudeApiError) {
      return reply.status(409).send({ message: error.message });
    }

    if (error instanceof NotFoundError) {
      return reply.status(404).send({ message: error.message });
    }
    return reply.status(500).send({
      error: `Não foi possível carregar o lead o cliente. Contacte o administrador de IT: ${error}`,
    });
  }
}
