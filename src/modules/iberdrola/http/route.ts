import { FastifyInstance } from "fastify";
import { iberdrolaSenderSms } from "./controllers/iberdrola-sender-sms.controller";
import { iberdrolaSms } from "./controllers/iberdrola-webhook-sms.controller";
import { iberdrolaPdf } from "./controllers/iberdrola-webhook-pdf.controller";

const basePath =
  process.env.NODE_ENV === "pre" ? "/preinsight360api" : "/Insight360api";

export function iberdrolaRoutes(app: FastifyInstance) {
  app.post(`${basePath}/iberdrola/sender`, iberdrolaSenderSms);
  app.post(`${basePath}/iberdrola/sms`, iberdrolaSms);
  app.post(`${basePath}/iberdrola/pdf`, iberdrolaPdf);
}
