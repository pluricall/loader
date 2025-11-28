import cron from "node-cron";
import { sendEmail } from "../utils/send-email";
import { GetClientRecordingsUseCase } from "../use-cases/recordings/get-client-recordings";
import { UploadRecordingsUseCase } from "../use-cases/recordings/upload-recordings";

const getClientRecordingsUseCase = new GetClientRecordingsUseCase();
const downloadRecordingsUseCase = new UploadRecordingsUseCase();

async function recordingCronJob() {
  try {
    const now = new Date();
    const currentHour = now.toTimeString().slice(0, 5);

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const dateStr = yesterday.toISOString().split("T")[0];

    const { clientRecord } = await getClientRecordingsUseCase.execute();

    const clientsToRun = clientRecord.filter(
      (c) => c.startTime.slice(0, 5) === currentHour,
    );

    console.log("Clientes que irão rodar agora:", clientsToRun);

    for (const client of clientsToRun) {
      console.log(
        `Iniciando download para cliente ${client.clientName} (${dateStr})...`,
      );

      try {
        const html = `
    <h2>✔️ CronJob Finalizado</h2>
    <p>Horário: <strong>${currentHour}</strong></p>
    <p>Data processada: <strong>${dateStr}</strong></p>
    <p>Clientes processados:</p>
    <ul>
      ${clientsToRun
        .map(
          (c) =>
            `<li><strong>${c.clientName}</strong> — campanha ${c.ct_}</li>`,
        )
        .join("")}
    </ul>
  `;

        await sendEmail({
          to: ["ryan.martins@pluricall.pt"],
          subject: `✔️ CronJob finalizado — ${dateStr} (${currentHour})`,
          html,
        });

        console.log("📧 E-mail de finalização enviado com sucesso.");
      } catch (err) {
        console.error("❌ Erro ao enviar e-mail de finalização do cron:", err);
      }

      try {
        await downloadRecordingsUseCase.execute({
          ctName: client.ct_,
          day: dateStr,
          percentDifferentsResult: client.percentDifferentsResult,
          driveId: client.driveId,
          isBd: client.isBd,
          folderPath: client.folderPath,
          isHistorical: client.isHistorical,
          resultsNotInFivePercent: client.resultsNotInFivePercent,
        });
      } catch (err) {
        console.error(`Erro processando cliente ${client.clientName}:`, err);
      }
    }
  } catch (err) {
    console.error("Erro no cron job:", err);
  }
}

export async function RecordingsJob() {
  cron.schedule("* * * * *", () => {
    console.log("Cron job rodando...");
    recordingCronJob();
  });
}
