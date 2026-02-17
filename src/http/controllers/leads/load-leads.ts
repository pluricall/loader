import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makeLoadLeadsUseCase } from "../../../use-cases/factories/make-load-leads-use-case";

export async function loadLeads(request: FastifyRequest, reply: FastifyReply) {
  // Validação do payload
  const schema = z.object({
    leads: z.array(z.record(z.any())).min(1, "At least one lead is required"),
  });

  let leads: any[];
  try {
    leads = schema.parse(request.body).leads;
  } catch (err: any) {
    return reply.status(400).send({
      message: "Invalid request payload",
      details: err.errors ?? err.message,
    });
  }

  // ✅ O client já está injetado pelo middleware
  const client = (request as any).client;

  // Instancia use-case
  const loadLeadsUseCase = makeLoadLeadsUseCase();

  // Executa carregamento (unitário ou massivo)
  const results = await loadLeadsUseCase.execute(client.client_name, leads);

  // Cria resumo final
  const errors = results
    .filter((r) => !r.success)
    .map((r) => ({ lead: r.lead, error: r.error }));

  return reply.status(200).send({
    total: results.length,
    success: results.filter((r) => r.success).length,
    failed: errors.length,
    errors,
  });
}
