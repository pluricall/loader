import { FastifyInstance } from "fastify";
import { iberdrolaRoutes } from "./modules/iberdrola/http/route";
import { servilusaRoutes } from "./modules/servilusa/http/routes";
import { createClient } from "./migrating/http/controllers/clients/create";
import { searchClients } from "./migrating/http/controllers/clients/search";
import { updateClient } from "./migrating/http/controllers/clients/update";
import { clientDetails } from "./migrating/http/controllers/clients/details";
import { removeClient } from "./migrating/http/controllers/clients/remove";
import { createBd } from "./migrating/http/controllers/bds/create";
import { searchBds } from "./migrating/http/controllers/bds/search";
import { bdDetails } from "./migrating/http/controllers/bds/details";
import { updateBd } from "./migrating/http/controllers/bds/update";
import { removeBd } from "./migrating/http/controllers/bds/remove";
import { plenitudeInsert } from "./migrating/http/controllers/plenitude/insert";
import { getSharepointFolders } from "./migrating/http/controllers/sharepoint/get-folders";
import { getSharepointDrives } from "./migrating/http/controllers/sharepoint/get-drives";
import { getSharepointSites } from "./migrating/http/controllers/sharepoint/get-sites";
import { downloadRecording } from "./migrating/http/controllers/recordings/download-from-sharepoint";
import { getRecordingsMetadatas } from "./migrating/http/controllers/recordings/get-metadatas";
import { updateClientRecordings } from "./migrating/http/controllers/recordings/update-client";
import { createClientRecordings } from "./migrating/http/controllers/recordings/create-client";
import { getClientsRecordings } from "./migrating/http/controllers/recordings/get-clients";
import { removeTyp } from "./migrating/http/controllers/typs/remove";
import { updateTyp } from "./migrating/http/controllers/typs/update";
import { typDetails } from "./migrating/http/controllers/typs/details";
import { searchTyps } from "./migrating/http/controllers/typs/search";
import { createTyp } from "./migrating/http/controllers/typs/create";

const basePath =
  process.env.NODE_ENV === "pre" ? "/preinsight360api" : "/Insight360api";

export function appRoutes(app: FastifyInstance) {
  app.register(iberdrolaRoutes);
  app.register(servilusaRoutes);

  app.post("/clients", createClient);
  app.get("/clients", searchClients);
  app.put("/clients/:id", updateClient);
  app.get("/clients/:id", clientDetails);
  app.delete("/clients/:id", removeClient);

  /* Bds */
  app.post("/clients/:clientId/bds", createBd);
  app.get("/clients/:clientId/bds", searchBds);
  app.get("/clients/:clientId/bds/:bdId", bdDetails);
  app.put("/clients/:clientId/bds/:bdId", updateBd);
  app.delete("/clients/:clientId/bds/:bdId", removeBd);

  /* Typ */
  app.post("/typ", createTyp);
  app.get("/typ", searchTyps);
  app.get("/typ/:id", typDetails);
  app.put("/typ/:id", updateTyp);
  app.delete("/typ/:id", removeTyp);

  /* Records */
  app.post("/records", () => {});
  app.get("/clients/records", getClientsRecordings);
  app.post("/clients/records", createClientRecordings);
  app.patch("/clients/records/:clientName", updateClientRecordings);
  app.get(`${basePath}/recordings/search`, getRecordingsMetadatas);
  app.get(`${basePath}/recording/download`, downloadRecording);

  /* Sharepoint */
  app.get("/sharepoint/sites", getSharepointSites);
  app.get("/sharepoint/drives", getSharepointDrives);
  app.get("/sharepoint/folders", getSharepointFolders);
  app.post(`${basePath}/plenitude`, plenitudeInsert);
}
