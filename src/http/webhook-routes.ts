import type { FastifyInstance } from "fastify";
import { minisom21121 } from "./controllers/minisom/21121";
import { minisom21051 } from "./controllers/minisom/21051";
import { minisomCorporate } from "./controllers/minisom/corporate";
import { agilidade24041 } from "./controllers/agilidade/24041";
import { saveLinceRequest } from "../utils/save-lince-request";
import { servilusa23081 } from "./controllers/servilusa/23081";

export function webhookRoutes(webhook: FastifyInstance) {
  webhook.post(`/ws/minisom/21121/`, minisom21121);
  webhook.post(`/ws/minisom/21051/`, minisom21051);
  webhook.post(`/ws/minisom/21011/`, minisomCorporate);
  webhook.post(`/ws/agilidade/24041/`, agilidade24041);
  webhook.post(`/ws/agilidade/23081/`, servilusa23081);
  webhook.route({
    method: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    url: "/*",
    handler: async (req, reply) => {
      const forwarded = req.headers["x-forwarded-for"] as string;
      const realIp = forwarded?.split(",")[0] || req.ip;

      await saveLinceRequest({
        method: req.method,
        endpoint: req.url,
        query: JSON.stringify(req.query ?? {}),
        headers: JSON.stringify(req.headers),
        body: JSON.stringify(req.body ?? {}),
        raw: (req as any).rawBody ?? null,
        ctype: req.headers["content-type"],
        auth: req.headers.authorization,
        ip: realIp,
        ua: req.headers["user-agent"],
      });

      reply.code(200).send();
    },
  });
}
