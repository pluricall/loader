import { z } from "zod";

export const minisomMetaSchema = z.object({
  phone_number: z.string(),
  lead_id: z.string(),
  form_id: z.string(),
  email: z.string(),
  full_name: z.string(),
  privacy: z.any().optional(),
  marketing: z.any().optional(),
});

export type MinisomMetaDTO = z.infer<typeof minisomMetaSchema>;
