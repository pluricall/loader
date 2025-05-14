import { z } from 'zod'

export const TypSchema = z.object({
  name: z.string(),
  separator: z.string(),
  entityName: z.enum([
    'ACTIVITY',
    'CONTACT_PROFILE',
    'CONSENT',
    'DNCL_ENTRY',
    'TABLE_SCHEMA_ENUM_VALUE',
    'WF_PROCESS_INSTANCE',
  ]),
  loadingMode: z.enum(['APPEND', 'UPDATE', 'APPEND_OR_UPDATE', 'REPLACE']),
  parserMode: z.string(),
  fields: z.array(z.string()),
  fixed_fields: z.record(z.string().or(z.number())),
})

export type TypBodyRequest = z.infer<typeof TypSchema>
