import type { FastifyInstance } from "fastify";
import { saveLinceRequest } from "../../shared/utils/save-lince-request";
import { minisomRoutes } from "../../modules/minisom/http/routes";
import { leadRoutes } from "../../modules/leads/http/routes";
import { agilidadeRoutes } from "../../modules/agilidade/http/routes";
import { servilusa23081 } from "../../modules/servilusa/http/controllers/servilusa-23081.controller";

export function webhookRoutes(webhook: FastifyInstance) {
  webhook.register(minisomRoutes);
  webhook.register(leadRoutes);
  webhook.register(agilidadeRoutes);
  webhook.post(`/ws/servilusa/23081/`, async (request, reply) => {
    let xmlString: string;

    if (typeof request.body === "string") {
      xmlString = request.body;
    } else if (typeof request.body === "object" && request.body !== null) {
      xmlString = Object.keys(request.body)[0] || "";
    } else {
      xmlString = "";
    }

    if (!xmlString || xmlString.trim() === "") {
      return reply.status(400).header("Content-Type", "application/xml").send(`
<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>ERROR</status>
  <message>XML não fornecido</message>
</response>`);
    }

    return servilusa23081({ ...request, body: xmlString }, reply);
  });
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
