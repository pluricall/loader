import { Worker } from "bullmq";
import { AltitudeCreateContact } from "../../providers/altitude/create-contact.service";
import { altitudeAuthService } from "../../providers/altitude/auth.service";
import { redisConnection } from "../connection";
import { MssqlAgilidadeRepository } from "../../../../modules/agilidade/repositories/mssql-agilidade.repository";
import { MssqlMinisomRepository } from "../../../../modules/minisom/repositories/mssql-minisom.repository";
import { MssqlServilusaRepository } from "../../../../modules/servilusa/repositories/mssql-servilusa.repository";

let worker: Worker | null = null;

export function startAltitudeWorker() {
  if (worker) return worker;

  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const agilidadeRepository = new MssqlAgilidadeRepository();
  const minisomRepository = new MssqlMinisomRepository();
  const servilusaRepository = new MssqlServilusaRepository();

  worker = new Worker(
    "altitude-create-contact",
    async (job) => {
      const { payload, environment, genId, repository } = job.data;

      try {
        await altitudeCreateContact.execute({
          environment,
          payload,
        });

        if (repository === "agilidade24041") {
          await agilidadeRepository.updateLeadStatus(genId, "LOADED");
        }

        if (repository === "minisomMeta") {
          await minisomRepository.updateLeadStatus(genId, "LOADED");
        }

        if (repository === "servilusa") {
          await servilusaRepository.updateLeadStatus(genId, "LOADED");
        }
      } catch (err: any) {
        console.error(`Erro no worker ao processar job ${genId}:`, err);

        if (repository === "agilidade24041") {
          await agilidadeRepository.updateLeadStatus(genId, "ERROR");
        }

        if (repository === "minisomMeta") {
          await minisomRepository.updateLeadStatus(genId, "ERROR");
        }

        if (repository === "servilusa") {
          await servilusaRepository.updateLeadStatus(genId, "ERROR");
        }

        throw err;
      }
    },
    {
      connection: redisConnection,
      concurrency: 1,
    },
  );

  worker.on("failed", (job, err) => {
    console.error(`Job ${job?.id} falhou:`, err);
  });

  worker.on("completed", (job) => {
    console.log(`Job ${job?.id} concluído`);
  });

  return worker;
}
