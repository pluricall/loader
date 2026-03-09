import { z } from "zod";

export const plenitudeBodySchema = z.object({
  environment: z.enum(["prod", "test"]).default("test"),
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
