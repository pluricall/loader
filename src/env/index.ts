import 'dotenv/config'
import z from 'zod'
import { CustomError } from '../errors/error'

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']),
  PORT: z.coerce.number().default(3333),
  DATABASE_URL: z.string(),
  BASE_URL: z.string(),
  UAGENT_WEB_API_VERSION: z.string(),
  SMTP_HOST: z.string(),
  SMTP_PORT: z.coerce.number(),
  SMTP_USER: z.string(),
  SMTP_PASS: z.string(),
  SMTP_FROM_NAME: z.string(),
  SMTP_FROM_EMAIL: z.string(),
})

const _env = envSchema.safeParse(process.env)

if (_env.success === false) {
  console.error('Invalid environment variables!', _env.error)
  throw new CustomError('Invalid environment variables!', 400)
}

export const env = _env.data
