import fs from 'fs'
import path from 'path'
import { env } from '../env'
import nodemailer from 'nodemailer'

interface SendEmailProps {
  files?: string[]
  campaignName?: string
  errors?: string
  title: string
}

export async function sendEmail({
  files = [],
  campaignName = 'Não informada',
  errors = '',
  title,
}: SendEmailProps) {
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: true,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    })

    const attachments = files
      .filter((filePath) => fs.existsSync(filePath))
      .map((filePath) => ({
        filename: path.basename(filePath),
        content: fs.readFileSync(filePath),
      }))

    const mailOptions = {
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to: 'ryangabriel_cap@hotmail.com',
      subject: `${title} - ${campaignName}`,
      html: `
        <div style="font-family: Arial, sans-serif; padding: 15px;">
          <p style="color: red;"><strong>⚠️ Houve uma falha no carregamento da campanha <code>${campaignName}</code>.</strong></p>
          ${
            attachments.length > 0
              ? '<p>Os arquivos <code>.typ</code> e <code>.dat</code> usados na operação estão em anexo para análise.</p>'
              : ''
          }
          ${errors ? `<pre style="background:#f4f4f4;padding:10px;border-radius:4px;">${errors}</pre>` : ''}
        </div>
      `,
      attachments,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('✅ E-mail enviado:', info.response)
  } catch (err) {
    console.error('❌ Falha ao enviar e-mail:', err)
  }
}
