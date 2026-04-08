import cron from "node-cron";
import { makeVmOutUseCase } from "../../modules/vm-out/application/use-cases/factories/vm-out-factory";

export function vmOutCron() {
  const vmOutUseCase = makeVmOutUseCase();
  cron.schedule("*/10 * * * *", async () => {
    try {
      await vmOutUseCase.execute();
      console.log("Cron job VM OUT finalizado");
    } catch (err) {
      console.error("Erro no cron job VM OUT:", err);
    }
  });
}
