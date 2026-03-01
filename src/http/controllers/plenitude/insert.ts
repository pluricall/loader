import { FastifyReply, FastifyRequest } from "fastify";
import { z } from "zod";
import { makePlenitudeInsert } from "../../../use-cases/plenitude/factories/make-plenitude-insert";
import { PlenitudeLoginError } from "../../../shared/errors/plenitude-login-error";

const plenitudeBodySchema = z.object({
  usuario: z.string().nonempty().min(1, "Deve enviar o usuário"),
  pass: z.string().nonempty().min(1, "Deve enviar a password"),
  version: z.string().default("3.0.0"),
  environment: z.enum(["prod", "test"]).default("prod"),
  digitalData: z.object({
    pais: z.string(),
    fecha_entrada: z.string(),
    fecha_comienzo: z.string(),
    fecha_codificacion: z.string(),
    cola_inicial: z.string(),
    contrato: z.string(),
    telefono: z.string(),
    categorizacion: z.string(),
    intentos: z.string(),
    productos: z.string(),
    source: z.string(),
    id_lead: z.string(),
    agente: z.string(),
    cod_promo: z.string(),
  }),
});

export async function plenitudeInsert(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  try {
    const { usuario, pass, version, environment, digitalData } =
      plenitudeBodySchema.parse(request.body);

    const plenitudeInsert = makePlenitudeInsert(environment);
    const result = await plenitudeInsert.execute(
      usuario,
      pass,
      digitalData,
      version,
    );

    return reply.send(result);
  } catch (error: any) {
    if (error instanceof PlenitudeLoginError) {
      return reply.status(400).send({ error: error.message });
    }
    return reply
      .status(500)
      .send({ error: "Erro interno", details: error.message });
  }
}
