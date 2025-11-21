import { FastifyInstance } from "fastify";
import { AltitudeController } from "../../modules/altitude/AltitudeController";

const altitudeController = new AltitudeController();

export async function altitudeRoutes(fastify: FastifyInstance) {
  fastify.post(
    "/createContact",
    altitudeController.createContact.bind(altitudeController),
  );
  fastify.get(
    "/get-directoryid/:campaignName",
    altitudeController.getDirectoryId.bind(altitudeController),
  );
  fastify.post(
    "/resubmitContacts",
    altitudeController.resubmitContacts.bind(altitudeController),
  );
  fastify.get(
    "/taskdata/:taskId",
    altitudeController.getBackgroundTaskData.bind(altitudeController),
  );
}
