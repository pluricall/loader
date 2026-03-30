import cron from "node-cron";
import { makeVmOutUseCase } from "../../modules/vm-out/application/use-cases/factories/vm-out-factory";

export function vmOutCron() {
  const useCase = makeVmOutUseCase();
  cron.schedule("*/10 * * * *", async () => {
    try {
      console.log("Iniciando cron job VM OUT");
      await useCase.execute();
      console.log("Cron job VM OUT finalizado");
    } catch (err) {
      console.error("Erro no cron job VM OUT:", err);
    }
  });
}
