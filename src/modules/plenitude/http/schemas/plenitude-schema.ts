import { z } from "zod";

export const plenitudeBodySchema = z.object({
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
