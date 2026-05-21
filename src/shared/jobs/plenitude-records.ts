import cron from "node-cron";
import { makePlenitudeRecordingsUseCase } from "../../modules/plenitude/application/factories/make-plenitude-recordings";

const useCase = makePlenitudeRecordingsUseCase();

export async function plenitudeRecordingsJob() {
  cron.schedule("0 7 * * *", () => {
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    useCase.execute({
      initialDate: dateStr,
      endDate: dateStr,
    });
  });
}
