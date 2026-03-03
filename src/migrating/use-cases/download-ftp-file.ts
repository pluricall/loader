import path from "node:path";
import { FtpRepository, Protocol } from "../repositories/ftp-repository";

interface SourceConfig {
  origin: Protocol;
  host: string;
  port?: number;
  username: string;
  password: string;
  full_url: string;
}

export class DownloadFtpFile {
  constructor(private readonly ftpClient: FtpRepository) {}

  async execute(
    source: SourceConfig,
    destinationPath: string,
    originalPath: string,
    targetPath: string,
  ) {
    const protocol =
      source.origin === Protocol.SFTP ? Protocol.SFTP : Protocol.FTP;

    try {
      await this.ftpClient.connect({
        protocol,
        host: source.host,
        port: source.port ?? (protocol === Protocol.FTP ? 21 : 22),
        user: source.username,
        password: source.password,
      });

      // 🔹 Resolver caminho remoto (decodifica %20, etc.)
      const fileUrl = new URL(source.full_url);
      const remoteFilePath = decodeURIComponent(fileUrl.pathname);

      // 🔹 Baixar arquivo
      await this.ftpClient.downloadFile(remoteFilePath, destinationPath);

      // 🔹 Garantir diretório de destino
      const targetDir = path.posix.dirname(targetPath);
      await this.ftpClient.ensureDir(targetDir);

      // 🔹 Renomear / mover arquivo remoto
      await this.ftpClient.rename(originalPath, targetPath);

      return {
        success: true,
        filePath: remoteFilePath,
        message: "Arquivo baixado e movido com sucesso",
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message,
        step: this.identifyErrorStep(err.message),
      };
    } finally {
      await this.ftpClient.disconnect();
    }
  }

  private identifyErrorStep(message: string) {
    if (message.includes("connect")) return "connection";
    if (message.includes("download")) return "download";
    if (message.includes("rename")) return "rename";
    return "unknown";
  }
}
