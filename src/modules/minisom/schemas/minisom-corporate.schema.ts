import { z } from "zod";

export const minisomCorporateSchema = z.object({
  adobe_campaign_code: z.any(),
  email: z.any().optional(),
  form_title: z.any().optional(),
  language: z.any().optional(),
  marketing_consensus_flag: z.any().optional(),
  name: z.any().optional(),
  surname: z.any().optional(),
  phone_number: z.any(),
  privacy_consensus_flag: z.any().optional(),
  address: z.any().optional(),
  free_message: z.any().optional(),
  type_of_request: z.any().optional(),
  utm_source: z.any().optional(),
});

export type MinisomCorporateDTO = z.infer<typeof minisomCorporateSchema>;
