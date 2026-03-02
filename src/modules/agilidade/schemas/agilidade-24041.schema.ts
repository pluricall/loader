import { z } from "zod";

export const agilidade24041Schema = z.object({
  nome: z.any(),
  telefone: z.any(),
  email: z.any().optional(),
  lead_id: z.any().optional(),
  dist_id: z.any().optional(),
  dataEntrada: z.any().optional(),
  dataPedido: z.any().optional(),
  localidade: z.any().optional(),
  ad_id: z.any().optional(),
  adset_id: z.any().optional(),
  campaign_id: z.any().optional(),
  horario: z.any().optional(),
  adset_name: z.any().optional(),
  form_id: z.any().optional(),
  marca: z.any().optional(),
});

export type Agilidade24041DTO = z.infer<typeof agilidade24041Schema>;
