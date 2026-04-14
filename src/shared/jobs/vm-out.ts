import cron from "node-cron";
import { makeVmOutUseCase } from "../../modules/vm-out/use-cases/factories/vm-out.factory";

export function vmOutCron() {
  const vmOutUseCase = makeVmOutUseCase();

  cron.schedule("*/10 * * * *", async () => {
    const now = new Date();
    const hour = now.getHours();
    const minute = now.getMinutes();

    // ❌ BLOQUEIA de 23:50 até 00:59
    if (
      (hour === 23 && minute >= 50) ||
      hour === 0 // tudo de 00:00 até 00:59
    ) {
      return;
    }

    await vmOutUseCase.execute();
    console.log("Cron VM OUT executado");
  });
}
