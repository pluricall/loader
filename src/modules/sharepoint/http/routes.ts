import { FastifyInstance } from "fastify";
import { getSitesController } from "./get-sites.controller";
import { getDrivesController } from "./get-drives.controller";
import { getFoldersController } from "./get-folders.controller";

export async function sharepointRoutes(app: FastifyInstance) {
  app.get("/sharepoint/sites", getSitesController);
  app.get("/sharepoint/sites/:siteId/drives", getDrivesController);
  app.get("/sharepoint/drives/:driveId/folders", getFoldersController);
}
