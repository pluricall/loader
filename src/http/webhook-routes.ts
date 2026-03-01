import type { FastifyInstance } from "fastify";
import { saveLinceRequest } from "../shared/utils/save-lince-request";
import { minisomRoutes } from "../modules/minisom/http/routes";
import { agilidadeRoutes } from "../modules/agilidade/http/routes";

export function webhookRoutes(webhook: FastifyInstance) {
  webhook.register(minisomRoutes);
  webhook.register(agilidadeRoutes);

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
