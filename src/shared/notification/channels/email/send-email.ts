import fs from "fs";
import nodemailer from "nodemailer";
import { env } from "../../../../env";
import { SendEmailProps } from "./email-types";

export async function sendEmail({
  attachments = [],
  subject,
  to,
  html,
}: SendEmailProps) {
  try {
    const transporter = nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT),
      secure: false,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS,
      },
    });

    const resolvedAttachments = attachments.map((att) => ({
      filename: att.filename,
      content:
        typeof att.content === "string"
          ? fs.readFileSync(att.content)
          : att.content,
    }));

    await transporter.sendMail({
      from: `"${env.SMTP_FROM_NAME}" <${env.SMTP_FROM_EMAIL}>`,
      to,
      subject,
      html,
      attachments: resolvedAttachments,
    });
  } catch (err) {
    console.error("❌ Falha ao enviar e-mail:", err);
    throw err;
  }
}
