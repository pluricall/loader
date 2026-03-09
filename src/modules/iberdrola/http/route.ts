import { FastifyInstance } from "fastify";
import { iberdrolaSenderSms } from "./controllers/iberdrola-sender-sms.controller";
import { iberdrolaSms } from "./controllers/iberdrola-webhook-sms.controller";
import { iberdrolaPdf } from "./controllers/iberdrola-webhook-pdf.controller";

export function iberdrolaRoutes(app: FastifyInstance) {
  app.post(`/iberdrola/sender`, iberdrolaSenderSms);
  app.post(`/iberdrola/sms`, iberdrolaSms);
  app.post(`/iberdrola/pdf`, iberdrolaPdf);
}
