import { z } from "zod";

export const minisom21051Schema = z.object({
  auth_key: z.string(),
  phone_number: z.string(),
  email: z.string(),
  first_name: z.string(),
  bd: z.string(),
  lead_id: z.string().or(z.number()),
  form_id: z.string().or(z.number()).optional(),
  last_name: z.any().optional(),
  birth_date: z.any().optional(),
  created_date: z.any().optional(),
  posted_date: z.any().optional(),
  marketing: z.any().optional(),
  privacy: z.any().optional(),
  utm_source: z.any().optional(),
  utm_code: z.any().optional(),
  address: z.any().optional(),
  city: z.any().optional(),
});

export type Minisom21051DTO = z.infer<typeof minisom21051Schema>;
