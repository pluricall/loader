import fs from "fs/promises";
import { makeFetchRecordingsUseCase } from "../factories/make-fetch-records-use-case";
import { sanitizeForSharePoint } from "../../utils/sanitize-for-sharepoint";
import { sendRecordingsToSharepoint } from "../../utils/send-file";
import { generateAndSendExcelReport } from "../../utils/sendExcelReport";
import { sendEmail } from "../../utils/send-email";
import { RecordingResult } from "./fetch-recordings";
import { PumaRepositoryImpl } from "../../repositories/mssql/puma-repository-impl";

export interface DownloadRecordingsRequest {
  ctName: string;
  day: string;
  percentDifferentsResult: number;
  folderPath: string;
  driveId: string;
  isBd: boolean;
  isHistorical: boolean;
  resultsNotInFivePercent: string | null;
}

export interface RecordingWithFolderInfo {
  record: RecordingResult;
  folderPath: string;
  fileName: string;
  origem: string;
  sharepointLocation: string;
  status: "SUCCESS" | "ERROR";
  errorMessage?: string;
}

export class UploadRecordingsUseCase {
  async execute(data: DownloadRecordingsRequest) {
    const fetchRecordingsUseCase = makeFetchRecordingsUseCase();
    const pumaRepositoryImpl = new PumaRepositoryImpl();

    const client = await pumaRepositoryImpl.findClientByCampaignClient(
      data.ctName,
    );

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

    const groupedByEasycode = recordings.reduce(
      (acc, r) => {
        const key = r.easycode?.toString() ?? "NA";
        if (!acc[key]) acc[key] = [];
        acc[key].push(r);
        return acc;
      },
      {} as Record<string, RecordingResult[]>,
    );

    for (const [easycode, records] of Object.entries(groupedByEasycode)) {
      const totalRecordingsForEasycode = records.length;

      for (const record of records) {
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

        if (totalRecordingsForEasycode > 1) {
          folderParts.push(easycode);
        }

        const folderPath = folderParts.join("/");
        const startTime = startDateObj.toISOString().replace(/[:.]/g, "-");

        let fileName = `${easycode}_${startTime}`;
        if (record.has_multiple_recordings) {
          fileName += `_${record.rec_time}`;
        }
        fileName = sanitizeForSharePoint(`${fileName}.wav`);

        const timestamp = String(record.time_stamp).replace(/[-: ]/g, "");
        const caminho = `${timestamp.slice(0, 4)}\\${timestamp.slice(4, 6)}\\${timestamp.slice(6, 8)}\\${timestamp.slice(8, 10)}\\${timestamp.slice(10, 12)}\\`;
        const ficheiro = `${timestamp.slice(12, 14)}${timestamp.slice(14, 17)}${record.rec_key}${record.rec_time}.wav`;
        const origem = `\\\\tiger\\D$\\RepositorioAVR\\Storage\\${caminho}${ficheiro}`;
        const sharepointLocation = `${folderPath}/${fileName}`;

        recordingsWithFolderInfo.push({
          record,
          folderPath,
          fileName,
          origem,
          sharepointLocation,
          status: "SUCCESS",
        });
      }
    }

    const successfulRecordings: RecordingWithFolderInfo[] = [];

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
        successfulRecordings.push(recordingInfo);

        if (!client) {
          throw new Error(
            `Cliente não encontrado para a campanha: ${recordingInfo.record.campaign}`,
          );
        }

        console.log(client.id, client.name);

        console.log(
          "Salvando no DB:",
          recordingInfo.fileName,
          client.id,
          client.name,
        );
        await pumaRepositoryImpl.saveSentRecordings({
          clientId: client?.id,
          clientName: client?.name,
          easycode: recordingInfo.record.easycode,
          campaign: recordingInfo.record.campaign,
          moment: recordingInfo.record.moment,
          language: this.detectLanguage(recordingInfo.record.campaign),
          sharepointLocation: recordingInfo.sharepointLocation,
          status: recordingInfo.status,
          errorMessage: recordingInfo.errorMessage ?? null,
          origem: recordingInfo.origem,
          fileName: recordingInfo.fileName,
          loginContacto: recordingInfo.record.loginContacto.trim(),
          duration: recordingInfo.record.duration,
          resultado: recordingInfo.record.resultado,
        });
        console.log("Salvo com sucesso!");
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
        <p>Campanha: <strong>${data.ctName}</strong></p>
        <p>Data: <strong>${data.day}</strong></p>
        <p>Total de gravações processadas: <strong>${recordingsWithFolderInfo.length}</strong></p>
        <p>Erros: <strong>${errors.length}</strong></p>

        <h3>Registros com erro:</h3>
        <ul>
          ${errors
            .map(
              (e) => `
              <li>
                <strong>Easycode:</strong> ${e.record.easycode} -
                <strong>Arquivo:</strong> ${e.fileName} -
                <strong>Erro:</strong> ${e.errorMessage}
              </li>
            `,
            )
            .join("")}
        </ul>

        <p>O relatório Excel está anexado.</p>
      `;

      const safeCtName = data.ctName.replace(/[^a-zA-Z0-9]/g, "_");
      const excelFileName = `Gravações_${safeCtName}_${data.day}.xlsx`;
      const excelLocalPath = `./reports/${excelFileName}`;

      await sendEmail({
        to: ["ryan.martins@pluricall.pt"],
        subject: `⚠️ Erros ao enviar gravações — ${data.ctName}`,
        html,
        files: [excelLocalPath],
      });
    }

    return {
      total: recordingsWithFolderInfo.length,
      successful: successfulRecordings.length,
      failed: errors.length,
      recordings: successfulRecordings,
    };
  }

  private detectLanguage(campaign: string): string {
    const lowerCampaign = campaign.toLowerCase();
    if (lowerCampaign.includes("_en") || lowerCampaign.includes("en"))
      return "en";
    if (lowerCampaign.includes("_es") || lowerCampaign.includes("es"))
      return "es";
    return "pt";
  }
}
