import { z } from "zod";

export const endesa22071Schema = z.object({
  lead_id: z.string().min(1, "lead_id obrigatório"),
  telefone: z.string().min(1, "Telefone obrigatório"),
  nome: z.string().min(1, "Nome obrigatório"),
  apelido: z.string().optional().default(""),
  genero: z.string().optional().default(""),
  data_nascimento: z.string().optional().default(""),
  cp4: z.coerce.number({ invalid_type_error: "cp4 deve ser número" }),
  cp3: z.coerce.number({ invalid_type_error: "cp3 deve ser número" }),
});

export type Endesa22071Schema = z.infer<typeof endesa22071Schema>;
