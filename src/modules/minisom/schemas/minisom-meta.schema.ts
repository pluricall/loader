import { z } from "zod";

export const minisomMetaSchema = z.object({
  phone_number: z.any(),
  lead_id: z.any(),
  form_id: z.any(),
  email: z.any(),
  full_name: z.any(),
  privacy: z.any().optional(),
  marketing: z.any().optional(),
});

export type MinisomMetaDTO = z.infer<typeof minisomMetaSchema>;
