import fs from "fs/promises";
import { makeFetchRecordingsUseCase } from "./factories/make-fetch-records-use-case";
import { sanitizeForSharePoint } from "../utils/sanitize-for-sharepoint";
import { sendRecordingsToSharepoint } from "../utils/send-file";
import { generateAndSendExcelReport } from "../utils/sendExcelReport";
import { sendEmail } from "../utils/send-email";

export interface DownloadRecordingsRequest {
  campaignName: string;
  day: string;
  percentDifferentsResult: number;
  folderPath: string;
  driveId: string;
  isBd: boolean;
  isHistorical: boolean;
  resultsNotInFivePercent: string | null;
}

export interface RecordingWithFolderInfo {
  record: any;
  folderPath: string;
  fileName: string;
  origem: string;
  sharepointLocation: string;
  status: "SUCCESS" | "ERROR";
  errorMessage?: string;
}

export class DownloadRecordingsUseCase {
  async execute(data: DownloadRecordingsRequest) {
    const fetchRecordingsUseCase = makeFetchRecordingsUseCase();
    const cleanResultsNotInFivePercent = data.resultsNotInFivePercent
      ? data.resultsNotInFivePercent
          .replace(/['"]/g, "")
          .split(",")
          .map((v) => v.trim())
          .filter(Boolean)
          .map((v) => `'${v}'`)
          .join(",")
      : "";

    const recordings = await fetchRecordingsUseCase.execute({
      ...data,
      resultsNotInFivePercent: cleanResultsNotInFivePercent,
    });

    const recordingsWithFolderInfo: RecordingWithFolderInfo[] = [];

    const grouped = recordings.reduce(
      (acc, r) => {
        const key = r.easycode?.toString() ?? "NA";
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
      },
      {} as Record<string, any[]>,
    );

    for (const record of recordings) {
      const startDateObj = new Date(record.moment ?? new Date());

      const ano = startDateObj.getFullYear();
      const mes = String(startDateObj.getMonth() + 1).padStart(2, "0");
      const dia = String(startDateObj.getDate()).padStart(2, "0");

      let campanha = record.campaign || "";
      campanha = campanha.replace(/^ct_/i, "");
      campanha = sanitizeForSharePoint(campanha);

      const bd =
        data.isBd && record.bd ? sanitizeForSharePoint(record.bd) : null;

      const folderParts = [data.folderPath, campanha];
      if (bd) folderParts.push(bd);
      folderParts.push(ano.toString(), mes, dia);

      const easycodeStr = record.easycode?.toString() ?? "NA";
      const realCount = grouped[easycodeStr]?.length || 0;

      if (realCount > 1) {
        folderParts.push(easycodeStr);
      }

      const folderPath = folderParts.join("/");
      const startTime = startDateObj.toISOString().replace(/[:.]/g, "-");
      const fileName = sanitizeForSharePoint(`${easycodeStr}_${startTime}.wav`);

      const timestamp = String(record.time_stamp).replace(/[-: ]/g, "");
      const caminho = `${timestamp.slice(0, 4)}\\${timestamp.slice(4, 6)}\\${timestamp.slice(6, 8)}\\${timestamp.slice(8, 10)}\\${timestamp.slice(10, 12)}\\`;
      const ficheiro = `${timestamp.slice(12, 14)}${timestamp.slice(14, 17)}${record.rec_key}${record.rec_time}.wav`;
      const origem = `\\\\tiger\\D$\\RepositorioAVR\\Storage\\${caminho}${ficheiro}`;

      recordingsWithFolderInfo.push({
        record,
        folderPath,
        fileName,
        origem,
        sharepointLocation: `${folderPath}/${fileName}`,
        status: "SUCCESS",
      });
    }

    for (const recordingInfo of recordingsWithFolderInfo) {
      try {
        const buffer = await fs.readFile(recordingInfo.origem);

        await sendRecordingsToSharepoint({
          driveId: data.driveId,
          folderPath: recordingInfo.folderPath,
          fileName: recordingInfo.fileName,
          buffer,
        });

        recordingInfo.status = "SUCCESS";
      } catch (err) {
        recordingInfo.status = "ERROR";
        recordingInfo.errorMessage = (err as Error).message;
        console.error(
          `❌ Erro ao enviar ${recordingInfo.record.rec_key}: ${(err as Error).message}`,
        );
      }
    }

    await generateAndSendExcelReport(recordingsWithFolderInfo, data);

    const errors = recordingsWithFolderInfo.filter((r) => r.status === "ERROR");

    if (errors.length > 0) {
      const html = `
    <h2>⚠️ Erros ao enviar gravações</h2>
    <p>Campanha: <strong>${data.campaignName}</strong></p>
    <p>Data: <strong>${data.day}</strong></p>

    <h3>Registros com erro:</h3>
    <ul>
      ${errors
        .map(
          (e) => `
          <li>
            <strong>Easycode:</strong> ${e.record.easycode} —
            <strong>Erro:</strong> ${e.errorMessage}
          </li>
        `,
        )
        .join("")}
    </ul>

    <p>O relatório Excel está anexado.</p>
  `;

      const safeCampaignName = data.campaignName.replace(/[^a-zA-Z0-9]/g, "_");
      const excelFileName = `Gravações_${safeCampaignName}_${data.day}.xlsx`;
      const excelLocalPath = `./reports/${excelFileName}`;

      await sendEmail({
        to: ["ryan.martins@pluricall.pt"],
        subject: `⚠️ Erros ao enviar gravações — ${data.campaignName}`,
        html,
        files: [excelLocalPath],
      });
    }

    return recordings;
  }
}
