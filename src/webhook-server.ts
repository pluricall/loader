import fastify, { FastifyReply, FastifyRequest } from "fastify";
import { env } from "./env";
import { ZodError } from "zod";
import { AltitudeApiError } from "./shared/errors/altitude-error";
import { AltitudeAuthError } from "./shared/errors/altitude-auth-error";
import formbody from "@fastify/formbody";
import fastifyCors from "@fastify/cors";
import { startAltitudeWorker } from "./shared/infra/queue/altitude/altitude-worker";
import { MssqlPluricallRepository } from "./migrating/repositories/mssql/mssql-pluricall-repository";
import { linceRoutes } from "./router-lince";
import { vmOutCron } from "./shared/jobs/vm-out";
import { startAltitudeVmOutWorker } from "./shared/infra/queue/vm-out/vm-out-worker";

export async function startWebhookServer() {
  const webhook = fastify({ requestTimeout: 0 });
  startAltitudeWorker();
  startAltitudeVmOutWorker();
  webhook.addContentTypeParser(
    ["application/xml", "text/xml"],
    { parseAs: "string" },
    function (req, body, done) {
      done(null, body);
    },
  );

  const pluricallRepository = new MssqlPluricallRepository();

  webhook.register(async () => {
    vmOutCron();
  });

  webhook.addHook(
    "onResponse",
    async (request: FastifyRequest, reply: FastifyReply) => {
      try {
        const routeUrl = request.routeOptions?.url ?? request.url;

        let safeBody: string;
        const body = request.body ?? {};

        if (typeof body === "string" && body.trim().startsWith("<?xml")) {
          safeBody =
            body.length > 20000
              ? body.substring(0, 20000) + "... [XML truncado]"
              : body;
        } else if (typeof body === "object") {
          const stringified = JSON.stringify(body);
          safeBody =
            stringified.length > 20000
              ? stringified.substring(0, 20000) + "... [truncated]"
              : stringified;
        } else {
          safeBody = String(body);
          if (safeBody.length > 20000) {
            safeBody = safeBody.substring(0, 20000) + "... [truncated]";
          }
        }

        await pluricallRepository.insertInsight360ApiLogs({
          method: request.method,
          route: routeUrl,
          requestUrl: request.url,
          requestIp: request.ip,
          headers: request.headers ?? {},
          body: safeBody,
          queryParams: request.query ?? {},
          responseStatus: reply.statusCode,
        });
      } catch (err: any) {
        console.error("❌ ERRO NO HOOK onResponse:", err);
        console.error("Stack trace:", err.stack);
      }
    },
  );

  webhook.register(formbody);
  webhook.register(linceRoutes);
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

    if (error.code === "FST_ERR_CTP_EMPTY_JSON_BODY") {
      return reply.status(400).send({
        error: "empty_json_body",
        message: "Body cannot be empty when Content-Type is application/json",
      });
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
