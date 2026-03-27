import { Worker } from "bullmq";
import { AltitudeCreateContact } from "../../providers/altitude/create-contact.service";
import { altitudeAuthService } from "../../providers/altitude/auth.service";
import { redisConnection } from "../connection";
import { MssqlMinisomRepository } from "../../../../modules/minisom/repositories/mssql-minisom.repository";
import { MssqlServilusaRepository } from "../../../../modules/servilusa/repositories/mssql-servilusa.repository";
import { AgilidadeMssqlRepository } from "../../../../modules/agilidade/infra/mssql/agilidade-mssql-repository";
import { EndesaMssqlRepository } from "../../../../modules/endesa/infra/mssql/endesa-mssql-repository";
import { MssqlVmOutRepository } from "../../../../modules/vm-out/infra/mssql/vm-out-mssql-repository";

let worker: Worker | null = null;

export function startAltitudeWorker() {
  if (worker) return worker;

  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const agilidadeRepository = new AgilidadeMssqlRepository();
  const minisomRepository = new MssqlMinisomRepository();
  const servilusaRepository = new MssqlServilusaRepository();
  const endesaRepository = new EndesaMssqlRepository();
  const vmOutRepository = new MssqlVmOutRepository();

  worker = new Worker(
    "altitude-create-contact",
    async (job) => {
      const { payload, environment, genId, repository } = job.data;

      try {
        const response = await altitudeCreateContact.execute({
          environment,
          payload,
        });

        if (repository === "minisomMeta") {
          await minisomRepository.updateStatus(genId, "LOADED");
        }

        if (repository === "minisom21121") {
          await minisomRepository.updateStatus(genId, "LOADED");
        }

        if (repository === "vm-out") {
          await vmOutRepository.updateStatus(
            genId,
            "LOADED",
            undefined,
            response ? JSON.stringify(response) : undefined,
          );
        }

        if (repository === "minisom21051") {
          await minisomRepository.updateStatus(genId, "LOADED");
        }

        if (repository === "minisomCorporate") {
          await minisomRepository.updateCorporateLeadStatus(genId, "LOADED");
        }

        if (repository === "agilidade24041") {
          await agilidadeRepository.updateStatus(genId, "LOADED");
        }
        if (repository === "servilusa") {
          await servilusaRepository.updateStatus(genId, "LOADED");
        }
        if (repository === "endesa22071") {
          await endesaRepository.updateStatus(genId, "LOADED");
        }
      } catch (err: any) {
        console.error(`Erro no worker ao processar job ${genId}:`, err);

        if (repository === "minisomMeta") {
          await minisomRepository.updateStatus(genId, "ERROR");
        }

        if (repository === "vm-out") {
          await vmOutRepository.updateStatus(genId, "ERROR", err.message);
        }

        if (repository === "minisom21121") {
          await minisomRepository.updateStatus(genId, "ERROR");
        }
        if (repository === "minisom21051") {
          await minisomRepository.updateStatus(genId, "ERROR");
        }

        if (repository === "minisomCorporate") {
          await minisomRepository.updateCorporateLeadStatus(genId, "ERROR");
        }

        if (repository === "agilidade24041") {
          await agilidadeRepository.updateStatus(genId, "ERROR");
        }

        if (repository === "servilusa") {
          await servilusaRepository.updateStatus(genId, "ERROR");
        }

        if (repository === "endesa22071") {
          await endesaRepository.updateStatus(genId, "ERROR");
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
