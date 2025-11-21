import { FastifyReply, FastifyRequest } from "fastify";
import { altitudeServiceInstance } from "./instances/AltitudeServiceInstance";
import { IContactsResubmitBody, ICreateContact } from "./@types";

export class AltitudeController {
  async createContact(
    req: FastifyRequest<{ Body: ICreateContact }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await altitudeServiceInstance.createContact(req.body);
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao criar contato" });
    }
  }

  async getDirectoryId(
    req: FastifyRequest<{ Params: { campaignName: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await altitudeServiceInstance.getDirectoryId({
        campaignName: req.params.campaignName,
      });
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao obter ID do diretório" });
    }
  }

  async resubmitContacts(
    req: FastifyRequest<{ Body: IContactsResubmitBody }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await altitudeServiceInstance.resubmitContacts(req.body);
      reply.send(result);
    } catch (error) {
      reply.status(500).send({ error: "Erro ao ressubmeter contatos" });
    }
  }

  async getBackgroundTaskData(
    req: FastifyRequest<{ Params: { taskId: string } }>,
    reply: FastifyReply,
  ) {
    try {
      const result = await altitudeServiceInstance.getBackgroundTaskData(
        req.params.taskId,
      );
      reply.send(result);
    } catch (error) {
      console.error("Erro ao obter dados da tarefa em segundo plano:", error);
      reply.status(500).send({
        error: "Erro ao obter dados da tarefa em segundo plano",
        details: error,
      });
    }
  }
}
