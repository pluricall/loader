import { Client as FtpLib } from "basic-ftp";
import SftpLib from "ssh2-sftp-client";

export enum Protocol {
  FTP = "ftp",
  SFTP = "sftp",
}

interface ConnectionOptions {
  protocol: Protocol;
  host: string;
  user: string;
  password: string;
  port?: number;
}

interface FtpRepositoryMethods {
  connect(data: ConnectionOptions): Promise<void>;
  downloadFile(remotePath: string, localPath: string): Promise<void>;
  rename(oldPath: string, newPath: string): Promise<void>;
  ensureDir(path: string): Promise<void>;
  disconnect(): Promise<void>;
}

export class FtpRepository implements FtpRepositoryMethods {
  private ftpClient: FtpLib | null = null;
  private sftpClient: SftpLib | null = null;
  private protocol: Protocol | null = null;

  async connect({ protocol, host, user, password, port }: ConnectionOptions) {
    this.protocol = protocol;

    try {
      switch (protocol) {
        case Protocol.FTP:
          this.ftpClient = new FtpLib();
          await this.ftpClient.access({
            host,
            user,
            password,
            port: port ?? 21,
            secure: false,
          });
          break;

        case Protocol.SFTP:
          this.sftpClient = new SftpLib();
          await this.sftpClient.connect({
            host,
            port: port ?? 22,
            username: user,
            password,
          });
          break;

        default:
          throw new Error("Protocolo inválido: use 'ftp' ou 'sftp'");
      }
    } catch (error: any) {
      throw new Error(
        `Erro ao conectar (${protocol.toUpperCase()}): ${error.message}`,
      );
    }
  }

  async downloadFile(remotePath: string, localPath: string) {
    this.ensureConnected();

    try {
      if (this.protocol === Protocol.FTP && this.ftpClient) {
        await this.ftpClient.downloadTo(localPath, remotePath);
      }

      if (this.protocol === Protocol.SFTP && this.sftpClient) {
        await this.sftpClient.fastGet(remotePath, localPath);
      }
    } catch (error: any) {
      throw new Error(`Erro ao baixar arquivo: ${error.message}`);
    }
  }

  async ensureDir(remoteDir: string) {
    this.ensureConnected();

    try {
      if (this.protocol === Protocol.FTP && this.ftpClient) {
        await this.ftpClient.ensureDir(remoteDir);
      }

      if (this.protocol === Protocol.SFTP && this.sftpClient) {
        const exists = await this.sftpClient.exists(remoteDir);
        if (!exists) {
          await this.sftpClient.mkdir(remoteDir, true);
        }
      }
    } catch (error: any) {
      throw new Error(`Erro ao garantir diretório remoto: ${error.message}`);
    }
  }

  async rename(oldPath: string, newPath: string) {
    this.ensureConnected();

    try {
      if (this.protocol === Protocol.FTP && this.ftpClient) {
        await this.ftpClient.rename(oldPath, newPath);
      }
      if (this.protocol === Protocol.SFTP && this.sftpClient) {
        await this.sftpClient.rename(oldPath, newPath);
      }
    } catch (error: any) {
      throw new Error(`Erro ao renomear arquivo: ${error.message}`);
    }
  }

  async disconnect() {
    try {
      if (this.protocol === Protocol.FTP && this.ftpClient) {
        this.ftpClient.close();
      }
      if (this.protocol === Protocol.SFTP && this.sftpClient) {
        await this.sftpClient.end();
      }
    } catch (error: any) {
      console.warn(`Aviso ao desconectar: ${error.message}`);
    }
  }

  // 🔒 Validação padrão
  private ensureConnected() {
    if (
      (this.protocol === Protocol.FTP && !this.ftpClient) ||
      (this.protocol === Protocol.SFTP && !this.sftpClient)
    ) {
      throw new Error("Cliente não conectado. Chame connect() antes de usar.");
    }
  }
}
