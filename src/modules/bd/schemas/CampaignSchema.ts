import { z } from 'zod'

export const CampaignSchema = z.object({
  name: z.string().min(1, 'O nome da campanha é obrigatório.'),
  expiration: z.string().datetime('Data de expiração inválida.'),
  campaign_type: z.enum(['INBOUND', 'OUTBOUND', 'BLENDED']),
  description: z.string().optional(),
})

export type CampaignBodyRequest = z.infer<typeof CampaignSchema>
