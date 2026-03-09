import { minisomRoutes } from "./modules/minisom/http/routes";
import { leadRoutes } from "./modules/leads/http/routes";
import { agilidadeRoutes } from "./modules/agilidade/http/routes";
import { endesaRoutes } from "./modules/endesa/http/routes";
import { FastifyInstance } from "fastify";
import { servilusaRoutes } from "./modules/servilusa/http/routes";
import { iberdrolaRoutes } from "./modules/iberdrola/http/route";
import { sharepointRoutes } from "./modules/sharepoint/http/routes";
import { plenitudeRoutes } from "./modules/plenitude/http/routes";

export function linceRoutes(app: FastifyInstance) {
  app.register(minisomRoutes);
  app.register(leadRoutes);
  app.register(agilidadeRoutes);
  app.register(endesaRoutes);
  app.register(servilusaRoutes);
  app.register(iberdrolaRoutes);
  app.register(sharepointRoutes);
  app.register(plenitudeRoutes);
}
