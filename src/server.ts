// import cors from "@fastify/cors";
// import { loadRoutes } from "./http/routes";
// import { errorHandler } from "./middlewares/ErrorHandler";
// import { altitudeRoutes } from "./http/routes/altitude";
// import { leadsRoutes } from "./http/routes/leads";
// import { agilidadeLeadsJob } from './jobs/agilidade'
// import { McSonaeJobs } from './jobs/mc_sonae'
// import { typRoutes } from "./modules/bd/typ/route";
// import { sourceRoutes } from "./modules/bd/source/routes";
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

// app.register(async () => {
// agilidadeLeadsJob(app)
// McSonaeJobs(app)
// });
app.register(async () => {
  RecordingsJob(app);
});

/* app.register(
  function (app, _, done) {
    app.register(sourceRoutes, { prefix: "bd" });
    // app.register(typRoutes, { prefix: "bd" });
    app.register(altitudeRoutes, { prefix: "altitude" });
    app.register(loadRoutes, { prefix: "load" });
    app.register(leadsRoutes, { prefix: "leads" });
    done();
    },
    { prefix: "api" },
    ); */

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
