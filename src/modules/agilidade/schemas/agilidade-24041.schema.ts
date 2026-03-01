import { z } from "zod";

export const agilidade24041Schema = z.object({
  nome: z.any(),
  telefone: z.any(),
  lead_id: z.any().optional(),
  email: z.any().optional(),
  localidade: z.any().optional(),
  created_date: z.any().optional(),
  ad_id: z.any().optional(),
  adset_id: z.any().optional(),
  campaign_id: z.any().optional(),
  ad_name: z.any().optional(),
  campaign_name: z.any().optional(),
  adset_name: z.any().optional(),
  form_id: z.any().optional(),
  dataEntrada: z.any().optional(),
  dataPedido: z.any().optional(),
  marca: z.any().optional(),
  horario: z.any().optional(),
  dist_id: z.any().optional(),
  posted_date: z.any().optional(),
  city: z.any().optional(),
});

export type Agilidade24041DTO = z.infer<typeof agilidade24041Schema>;
