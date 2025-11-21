import fs from "fs/promises";
import path from "path";
import { spawn } from "child_process";
import { IUciLoaderBody } from "./@types";
import { LoaderTaskModel } from "./models/UciLoaderModel";
import { BackgroundTaskResult } from "./methods/BackgroundTask";

export class UciLoaderService {
  constructor(private readonly loaderTaskModel: LoaderTaskModel) {}

  async createTyp({
    entityName,
    fields,
    fixedFields,
    loadingMode,
    separator,
    outputPath,
  }: IUciLoaderBody & { outputPath?: string }): Promise<string> {
    const metadata = [
      "@@@",
      `@Separator = "${separator}"`,
      `@EntityName = "${entityName}"`,
      `@LoadingMode = "${loadingMode}"`,
      "@@@",
    ].join("\n");

    const variableFields = fields.join("\n");

    const fixedFieldsBlock = Object.entries(fixedFields)
      .map(([key, value]) => {
        const isString = typeof value === "string" && value !== "";
        return `${key}=${isString ? `"${value}"` : value}`;
      })
      .join("\n");

    const fullContent = `${metadata}\n${variableFields}\n%\n${fixedFieldsBlock}\n`;

    const finalOutputPath =
      outputPath ??
      path.join(__dirname, `../../../../tmp/typ-files/${Date.now()}.typ`);

    await fs.writeFile(finalOutputPath, fullContent, "utf-8");

    return finalOutputPath;
  }

  async runningUciLoader(typPath: string, datPath: string) {
    return new Promise<string>((resolve, reject) => {
      const command = `"C:\\Users\\rgsm\\OneDrive - Pluricall\\Informática\\05 - Projectos\\Insight360\\uciloader\\uciLoader.exe" -m 172.30.226.5:1500 -l rgsm:Neiajonas123? -f "${typPath}" -i "${datPath}"`;

      const process = spawn(command, { shell: true });

      let stdoutData = "";

      process.stdout.on("data", (data) => {
        const output = data.toString();
        stdoutData += output;
      });

      process.stderr.on("data", (data) => {
        console.error("stderr:", data.toString());
      });

      process.on("close", (code) => {
        if (code === 0) {
          const match = stdoutData.match(/task inserted with ID=(\d+)/);
          if (match) {
            const taskId = match[1].toString();
            resolve(taskId);
          } else {
            reject(new Error("ID da tarefa não encontrado na saída."));
          }
        } else {
          reject(new Error(`Processo finalizado com erro. Código: ${code}`));
        }
      });

      process.stdin.write("y\n");

      process.stdin.end();
    });
  }

  async saveLoaderTask(resultOfTask: BackgroundTaskResult) {
    await this.loaderTaskModel.create({
      task_id: resultOfTask.Id,
      status: resultOfTask.Status,
      status_description: resultOfTask.StatusDescription || "",
      percentage_done: resultOfTask.PercentageDone,
      creation_moment: new Date(resultOfTask.CreationMoment),
      start_moment: new Date(resultOfTask.StartMoment),
      end_moment: new Date(resultOfTask.EndMoment),
      internal: resultOfTask.Internal,
    });
  }
}
