import type { FastifyInstance } from "fastify";
import { createClient } from "./controllers/clients/create";
import { createBd } from "./controllers/bds/create";
import { createTyp } from "./controllers/typs/create";
import { searchClients } from "./controllers/clients/search";
import { searchBds } from "./controllers/bds/search";
import { searchTyps } from "./controllers/typs/search";
import { clientDetails } from "./controllers/clients/details";
import { bdDetails } from "./controllers/bds/details";
import { typDetails } from "./controllers/typs/details";
import { updateClient } from "./controllers/clients/update";
import { updateBd } from "./controllers/bds/update";
import { updateTyp } from "./controllers/typs/update";
import { removeClient } from "./controllers/clients/remove";
import { removeBd } from "./controllers/bds/remove";
import { removeTyp } from "./controllers/typs/remove";
import { getSharepointSites } from "./controllers/sharepoint/get-sites";
import { getSharepointDrives } from "./controllers/sharepoint/get-drives";
import { getSharepointFolders } from "./controllers/sharepoint/get-folders";
import { createClientRecordings } from "./controllers/recordings/create-client";
import { getClientsRecordings } from "./controllers/recordings/get-clients";
import { updateClientRecordings } from "./controllers/recordings/update-client";
import { getRecordingsMetadatas } from "./controllers/recordings/get-metadatas";
import { downloadRecording } from "./controllers/recordings/download-from-sharepoint";
import { plenitudeInsert } from "./controllers/plenitude/insert";
import { iberdrolaSenderSms } from "./controllers/iberdrola/sender-sms";
import { iberdrolaPdf } from "./controllers/iberdrola/webhook-pdf";
import { iberdrolaSms } from "./controllers/iberdrola/webhook.sms";
import { minisomMeta } from "./controllers/minisom/meta";
import { minisom21121 } from "./controllers/minisom/21121";
import { minisom21051 } from "./controllers/minisom/21051";
import { minisomCorporate } from "./controllers/minisom/corporate";
import { agilidade24041 } from "./controllers/agilidade/24041";

const basePath =
  process.env.NODE_ENV === "pre" ? "/preinsight360api" : "/Insight360api";

export function appRoutes(app: FastifyInstance) {
  /* Clients */
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
  app.post(`${basePath}/iberdrola/sender`, iberdrolaSenderSms);
  app.post(`${basePath}/iberdrola/sms`, iberdrolaSms);
  app.post(`${basePath}/iberdrola/pdf`, iberdrolaPdf);
  app.post(`${basePath}/minisom/meta`, minisomMeta);
  app.post(`/ws/minisom/21121/`, minisom21121);
  app.post(`/ws/minisom/21051/`, minisom21051);
  app.post(`/ws/minisom/21011/`, minisomCorporate);
  app.post(`/ws/agilidade/24041/`, agilidade24041);
}
