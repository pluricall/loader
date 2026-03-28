import { Worker } from "bullmq";
import { AltitudeCreateContact } from "../../providers/altitude/create-contact.service";
import { altitudeAuthService } from "../../providers/altitude/auth.service";
import { redisConnection } from "../connection";
import { MssqlVmOutRepository } from "../../../../modules/vm-out/infra/mssql/vm-out-mssql-repository";
import { sendEmail } from "../../../utils/send-email";

let worker: Worker | null = null;

export function startAltitudeVmOutWorker() {
  if (worker) return worker;

  const altitudeCreateContact = new AltitudeCreateContact(altitudeAuthService);
  const vmOutRepository = new MssqlVmOutRepository();

  worker = new Worker(
    "vm-out-create-contact",
    async (job) => {
      const { payload, environment, genId, repository } = job.data;

      try {
        const response = await altitudeCreateContact.execute({
          environment,
          payload,
        });

        if (repository === "vm-out") {
          await vmOutRepository.updateStatus(
            genId,
            "LOADED",
            undefined,
            response ? JSON.stringify(response) : undefined,
          );
        }
      } catch (err: any) {
        console.error(`Erro no worker ao processar job VM_OUT ${genId}:`, err);
        await sendEmail({
          to: ["ryan.martins@pluricall.pt"],
          subject: "Erro no worker VM_OUT",
          html: `Erro: ${err.message} <br><br> GenId: ${genId}`,
        });
        if (repository === "vm-out") {
          await vmOutRepository.updateStatus(genId, "ERROR", err.message);
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
