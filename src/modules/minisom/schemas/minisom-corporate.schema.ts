import { z } from "zod";

export const minisomCorporateSchema = z.object({
  adobe_campaign_code: z.string(),
  email: z.string().optional(),
  form_title: z.string().optional(),
  language: z.string().optional(),
  marketing_consensus_flag: z.string().optional(),
  name: z.string().optional(),
  surname: z.string().optional(),
  phone_number: z.string(),
  privacy_consensus_flag: z.string().optional(),
  address: z.string().optional(),
  free_message: z.string().optional(),
  type_of_request: z.string().optional(),
  utm_source: z.string().optional(),
});

export type MinisomCorporateDTO = z.infer<typeof minisomCorporateSchema>;
