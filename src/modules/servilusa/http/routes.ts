import { FastifyInstance } from "fastify";
import { servilusa23081 } from "./controllers/servilusa-23081.controller";

export function servilusaRoutes(app: FastifyInstance) {
  app.post(`/ws/servilusa/23081/`, async (request, reply) => {
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
}
