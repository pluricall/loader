import fastify, { FastifyReply } from "fastify";
import { env } from "./env";
import { appRoutes } from "./http/route";
import { ZodError } from "zod";
import fastifyCors from "@fastify/cors";
import { RecordingsJob } from "./jobs/recordings";
import { AltitudeApiError } from "./use-cases/errors/altitude-error";
import { AltitudeAuthError } from "./use-cases/errors/altitude-auth-error";

export const app = fastify({ requestTimeout: 0 });

app.register(appRoutes);

app.register(fastifyCors, {
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
  allowedHeaders: ["Content-Type"],
});

app.register(async () => {
  RecordingsJob();
});

app.setErrorHandler((error, _request, reply: FastifyReply) => {
  // ✅ ERRO ALTITUDE (vem antes de Zod)
  if (error instanceof AltitudeApiError) {
    return reply.status(error.statusCode).send({
      source: "altitude",
      code: error.details?.code,
      message: error.details?.message,
      details: error.details?.args ?? null,
    });
  }

  // ✅ ZOD
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

  // ✅ Fastify validation (schema)
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

  // 🔥 fallback
  if (env.NODE_ENV !== "production") {
    console.error(error);
  }

  return reply.status(500).send({
    error: "internal_error",
  });
});

app
  .listen({
    host: "0.0.0.0",
    port: 3333,
  })
  .then(() => console.log(`Server running on port ${env.PORT}`));
