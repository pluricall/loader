import fastify, { FastifyReply } from "fastify";
import { env } from "./env";
import { appRoutes } from "./http/route";
import { ZodError } from "zod";
import fastifyCors from "@fastify/cors";
import { RecordingsJob } from "./jobs/recordings";

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
  if (error instanceof ZodError) {
    const issues = error.errors.map((err) => {
      return {
        field: err.path.join(".") || "body",
        message: err.message,
      };
    });

    return reply.status(400).send({
      message: "Validation error",
      issues,
    });
  }

  if (env.NODE_ENV !== "production") {
    console.error(error);
  }

  return reply.status(500).send({ error: "Internal server error" });
});

app
  .listen({
    host: "0.0.0.0",
    port: 3333,
  })
  .then(() => console.log(`Server running on port ${env.PORT}`));
