import { SendEmailProps } from "./channels/email/email-types";
import { sendEmail } from "./channels/email/send-email";

interface SendNotificationProps {
  channel: "email";
  payload: SendEmailProps;
}

export async function sendNotification({
  channel,
  payload,
}: SendNotificationProps) {
  switch (channel) {
    case "email":
      return await sendEmail(payload);
    default:
      throw new Error(`Canal de notificação não suportado: ${channel}`);
  }
}
