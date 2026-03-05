import { z } from "zod";

export const agilidade24041Schema = z.object({
  nome: z.string().min(1, "Nome obrigatório"),
  telefone: z.string().min(1, "Telefone obrigatório"),
  email: z.string().optional(),
  lead_id: z.string().optional(),
  dist_id: z.string().optional(),
  dataEntrada: z.string().optional(),
  dataPedido: z.string().optional(),
  localidade: z.string().optional(),
  ad_id: z.string().optional(),
  adset_id: z.string().optional(),
  campaign_id: z.string().optional(),
  horario: z.string().optional(),
  adset_name: z.string().optional(),
  form_id: z.string().optional(),
  marca: z.string().optional(),
});

export type Agilidade24041Schema = z.infer<typeof agilidade24041Schema>;
