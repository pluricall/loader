export interface EmailAttachment {
  filename: string;
  content: Buffer | string;
}

export interface SendEmailProps {
  attachments?: EmailAttachment[];
  subject: string;
  html: string;
  to: string[];
}
