import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./env";
import { ZodError } from "zod";
import { AltitudeApiError } from "./shared/errors/altitude-error";
import { AltitudeAuthError } from "./shared/errors/altitude-auth-error";
import { webhookRoutes } from "./http/webhook-routes";
import formbody from "@fastify/formbody";
import fastifyCors from "@fastify/cors";
import { MssqlPluricallRepository } from "./repositories/mssql/mssql-pluricall-repository";

export async function startWebhookServer() {
  const webhook = fastify({ requestTimeout: 0 });
  webhook.addContentTypeParser(
    ["application/xml", "text/xml"],
    { parseAs: "string" },
    function (req, body, done) {
      done(null, body);
    },
  );

  const pluricallRepository = new MssqlPluricallRepository();

  webhook.addHook(
    "onResponse",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const safeBody = JSON.stringify(request.body ?? {});
        const truncatedBody =
          safeBody.length > 20000 ? safeBody.substring(0, 20000) : safeBody;

        await pluricallRepository.insertInsight360ApiLogs({
          method: request.method,
          route: request.routeOptions?.url ?? request.url,
          requestUrl: request.url,
          requestIp: request.ip,
          headers: request.headers ?? {},
          body: truncatedBody,
          queryParams: request.query ?? {},
          responseStatus: reply.statusCode,
        });
      } catch (err) {
        console.error("Failed to log request:", err);
      }
    },
  );

  webhook.register(formbody);
  webhook.register(webhookRoutes);
  webhook.register(fastifyCors, {
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type"],
  });

  webhook.setErrorHandler((error, _request, reply: FastifyReply) => {
    if (error instanceof AltitudeApiError) {
      return reply.status(error.statusCode).send({
        source: "altitude",
        code: error.details?.code,
        message: error.details?.message ?? error.message,
        details: error.details?.args ?? null,
      });
    }

    if (error instanceof ZodError) {
      return reply.status(400).send({
        error: error.errors.map((e) => e.message).join(", "),
      });
    }

    if (error instanceof ZodError) {
      const issues = error.errors.map((err) => ({
        field: err.path.join(".") || "body",
        message: err.message,
      }));

      return reply.status(400).send({
        error: "validation_error",
        issues,
      });
    }

    if ((error as any).validation) {
      return reply.status(400).send({
        error: "validation_error",
        details: (error as any).validation,
      });
    }

    if (error instanceof AltitudeAuthError) {
      return reply.status(error.statusCode).send({
        source: "altitude-auth",
        code: error.code,
        message: error.description,
      });
    }

    if (env.NODE_ENV !== "production") {
      console.error(error);
    }

    return reply.status(500).send({
      error: "internal_error",
    });
  });

  webhook
    .listen({
      host: "0.0.0.0",
      port: env.WEBHOOK_PORT,
    })
    .then(() =>
      console.log(`Webhook server running on port ${env.WEBHOOK_PORT}`),
    );
}
