import z from 'zod'

export const SourceSchema = z
  .object({
    origin: z.enum(['directory', 'ftp', 'sftp'], {
      message: 'A origem é obrigatória!',
    }),
    name: z.string().min(1, { message: 'O nome da BD é obrigatório!' }),
    host: z.string().nullable(),
    port: z.coerce.number().nullable(),
    username: z.string().nullable(),
    password: z.string().nullable(),
    localPath: z.string().nullable(),
    frequency: z.enum(['daily', 'weekly', 'monthly'], {
      message: 'A frequência é obrigatória!',
    }),
    startTime: z
      .string()
      .min(1, { message: 'O horário de início é obrigatório!' }),
    endTime: z.string().min(1, { message: 'O horário final é obrigatório!' }),
    interval: z.coerce
      .number()
      .min(5, { message: 'O intervalo deve ser no mínimo 5 minutos!' }),
    dayOfWeek: z.array(z.number()).optional(),
    dayOfMonth: z.array(z.number()).optional(),
    campaignId: z
      .string()
      .min(1, { message: 'O id da campanha é obrigatório!' }),
    typId: z.string().uuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.origin === 'directory' && !data.localPath) {
      ctx.addIssue({
        code: 'custom',
        path: ['localPath'],
        message: 'O caminho do diretório é obrigatório!',
      })
    }
    if (data.origin !== 'directory') {
      if (!data.host) {
        ctx.addIssue({
          code: 'custom',
          path: ['host'],
          message: 'O host é obrigatória!',
        })
      }
      if (!data.username) {
        ctx.addIssue({
          code: 'custom',
          path: ['username'],
          message: 'O usuário é obrigatório!',
        })
      }
      if (!data.password) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'A senha é obrigatória!',
        })
      }
      if (!data.port) {
        ctx.addIssue({
          code: 'custom',
          path: ['port'],
          message: 'A porta é obrigatória!',
        })
      }
    }
    if (data.frequency === 'weekly' && !data.dayOfWeek) {
      ctx.addIssue({
        code: 'custom',
        path: ['dayOfWeek'],
        message: 'Selecione um ou mais dias da semana!',
      })
    }
    if (data.frequency === 'monthly' && !data.dayOfMonth) {
      ctx.addIssue({
        code: 'custom',
        path: ['dayOfMonth'],
        message: 'Pelo menos um dia do mês deve ser selecionado!',
      })
    }
  })

export const SourceUpdateSchema = z
  .object({
    origin: z.enum(['directory', 'ftp', 'sftp'], {
      message: 'A origem é obrigatória!',
    }),
    name: z.string().min(1, { message: 'O nome da BD é obrigatório!' }),
    host: z.string().nullable(),
    port: z.coerce.number().nullable(),
    username: z.string().nullable(),
    password: z.string().nullable(),
    localPath: z.string().nullable(),
    frequency: z.enum(['daily', 'weekly', 'monthly'], {
      message: 'A frequência é obrigatória!',
    }),
    startTime: z
      .string()
      .min(1, { message: 'O horário de início é obrigatório!' }),
    endTime: z.string().min(1, { message: 'O horário final é obrigatório!' }),
    interval: z.coerce
      .number()
      .min(5, { message: 'O intervalo deve ser no mínimo 5 minutos!' }),
    dayOfWeek: z.array(z.number()).optional(),
    dayOfMonth: z.array(z.number()).optional(),
    typId: z.string().uuid().optional().nullable(),
  })
  .superRefine((data, ctx) => {
    if (data.origin === 'directory' && !data.localPath) {
      ctx.addIssue({
        code: 'custom',
        path: ['localPath'],
        message: 'O caminho do diretório é obrigatório!',
      })
    }
    if (data.origin !== 'directory') {
      if (!data.host) {
        ctx.addIssue({
          code: 'custom',
          path: ['host'],
          message: 'O host é obrigatória!',
        })
      }
      if (!data.username) {
        ctx.addIssue({
          code: 'custom',
          path: ['username'],
          message: 'O usuário é obrigatório!',
        })
      }
      if (!data.password) {
        ctx.addIssue({
          code: 'custom',
          path: ['password'],
          message: 'A senha é obrigatória!',
        })
      }
      if (!data.port) {
        ctx.addIssue({
          code: 'custom',
          path: ['port'],
          message: 'A porta é obrigatória!',
        })
      }
    }
    if (data.frequency === 'weekly' && !data.dayOfWeek) {
      ctx.addIssue({
        code: 'custom',
        path: ['dayOfWeek'],
        message: 'Selecione um ou mais dias da semana!',
      })
    }
    if (data.frequency === 'monthly' && !data.dayOfMonth) {
      ctx.addIssue({
        code: 'custom',
        path: ['dayOfMonth'],
        message: 'Pelo menos um dia do mês deve ser selecionado!',
      })
    }
  })

export type SourceBodyRequest = z.infer<typeof SourceSchema>
export type SourceBodyUpdateRequest = z.infer<typeof SourceUpdateSchema>
