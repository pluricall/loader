import fs from 'fs'
import path from 'path'
import { env } from '../env'
import nodemailer from 'nodemailer'

export async function sendEmail(
  filePaths?: string[],
  campaignName?: string | null,
) {
  const transporter = nodemailer.createTransport({
    host: env.SMTP_HOST,
    port: Number(env.SMTP_PORT),
    secure: true,
    auth: {
      user: env.SMTP_USER,
      pass: env.SMTP_PASS,
    },
  })

  const attachments =
    filePaths &&
    filePaths
      .filter((filePath) => fs.existsSync(filePath))
      .map((filePath) => ({
        filename: path.basename(filePath),
        content: fs.readFileSync(filePath),
      }))

  const mailOptions = {
    from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
    to: ['ryangabriel_cap@hotmail.com'],
    subject: 'Erro na Carga UCI – Arquivos em Anexo',
    html: `
      <div style="font-family: Arial, sans-serif; padding: 15px;">
        <p style="color: red;"><strong>⚠️ Houve uma falha na execução do UCI Loader na campanha ${campaignName}.</strong></p>
        <p>Os arquivos <code>.typ</code> e <code>.dat</code> usados na operação estão em anexo para análise.</p>
      </div>
    `,
    attachments,
  }

  const info = await transporter.sendMail(mailOptions)
  console.log('✅ E-mail enviado:', info.response)
}
