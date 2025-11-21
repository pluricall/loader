import path from "path";
import { UciLoaderService } from "../altitude/UciLoaderService";
import { uciLoaderServiceInstance } from "../altitude/instances/UciLoaderServiceInstance";
import { FtpService } from "../ftp/FtpService";
import { waitForTaskCompletion } from "./utils/waitForTaskCompletion";
import { prepareTempFolderAndPaths } from "./utils/prepareTempFoldersAndPath";
import { CustomError } from "../../errors/error";
import { FileService } from "../file/FileService";
import { IFTPClient } from "../ftp/utils/IFtpClient";
import { sendEmail } from "../../utils/send-email";
import { BdsRepository } from "../../repositories/bds-repository";
import { NotFoundError } from "../../use-cases/errors/not-found-error";

export class LoadService {
  constructor(
    private readonly bdsRepository: BdsRepository,
    private readonly uciLoaderService: UciLoaderService = uciLoaderServiceInstance,
  ) {}

  async processUciLoaderForBd(bdId: string) {
    let typPath: string | null = null;
    let datPath: string | null = null;
    let bdName: string;
    let originalPath: { filePath: string; client?: IFTPClient };

    try {
      const bd = await this.bdsRepository.findById(bdId);

      if (!bd) {
        return new NotFoundError("Bd not found.");
      }

      bdName = bd?.bd_name;

      if (!bd.source) {
        throw new CustomError("Nenhum source encontrado para esta BD.", 404);
      }

      const { tempFolder, datDestinationPath } =
        await prepareTempFolderAndPaths(bd.source);
      datPath = datDestinationPath;

      switch (bd.source.origin) {
        case "ftp":
        case "sftp": {
          const ftpService = new FtpService();
          originalPath = await ftpService.getFile(
            bd.source,
            datDestinationPath,
          );
          break;
        }
        case "directory": {
          const localService = new FileService();
          originalPath = await localService.download(
            bd.source,
            datDestinationPath,
          );
          break;
        }
        default:
          throw new CustomError(
            `Tipo de origem '${bd.source.origin}' não suportado.`,
            400,
          );
      }

      typPath = await this.uciLoaderService.createTyp({
        entityName: bd.source.typ?.entity_name,
        fields: bd.source.typ.fields,
        fixedFields: bd.source.typ.fixed_fields,
        loadingMode: bd.source.typ?.loading_mode,
        separator: bd.source.typ.separator,
        outputPath: path.join(
          tempFolder,
          `${path.parse(datDestinationPath).name}.typ`,
        ),
      });

      const taskId = await this.uciLoaderService.runningUciLoader(
        typPath,
        datPath,
      );

      const resultOfTask = await waitForTaskCompletion(taskId, {
        bdName,
        files: [typPath, datPath].filter(Boolean) as string[],
        onSuccess: (res) => this.uciLoaderService.saveLoaderTask(res),
      });

      const newFileName = `${resultOfTask.CreationMoment}_${resultOfTask.Id}.dat`;
      const moveNewFileNameToFileCarregados = path.join(
        path.dirname(originalPath.filePath),
        "CARREGADOS",
      );

      const newFilePath = path
        .join(moveNewFileNameToFileCarregados, newFileName)
        .replace(/\\/g, "/");

      switch (bd.source.origin) {
        case "ftp":
        case "sftp": {
          const ftpService = new FtpService();
          await ftpService.moveFile(
            bd.source,
            originalPath.filePath,
            newFilePath,
          );
          break;
        }
        case "directory": {
          const localService = new FileService();
          await localService.moveFile(
            bd.source,
            originalPath.filePath,
            newFilePath,
          );
          break;
        }
      }

      await sendEmail({
        subject: `✅ Carga ${bdName} concluída!`,
        to: ["ryan.martins@pluricall.pt"],
        html: "<div>Carregamento concluído<div>",
      });

      return { resultTask: resultOfTask };
    } catch (error: any) {
      const failedFiles = [typPath, datPath].filter(Boolean) as string[];
      await sendEmail({
        subject: `❌ Erro Carga ${bdName} concluída!`,
        to: ["ryan.martins@pluricall.pt"],
        html: "<div>Carregamento não concluído<div>",
        files: failedFiles,
      });
      console.error("❌ Erro na carga UCI:", error.message);
      throw error;
    }
  }
}
