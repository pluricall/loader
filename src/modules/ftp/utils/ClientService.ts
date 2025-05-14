import SftpClient from 'ssh2-sftp-client'
import * as ftp from 'basic-ftp'
import { IFTPClient } from './IFtpClient'

export class SftpClientService implements IFTPClient {
  private client: SftpClient

  constructor() {
    this.client = new SftpClient()
  }

  async ensureDir(path: string) {
    await this.client.mkdir(path, true)
  }

  async connect(options: {
    host: string
    user?: string
    password?: string
    port?: number
  }) {
    await this.client.connect(options)
  }

  async downloadFile(remotePath: string, localPath: string) {
    await this.client.fastGet(remotePath, localPath)
  }

  async rename(oldPath: string, newPath: string) {
    await this.client.rename(oldPath, newPath)
  }

  close() {
    this.client.end()
  }
}

export class BasicFtpClientService implements IFTPClient {
  private client: ftp.Client

  constructor() {
    this.client = new ftp.Client()
    this.client.ftp.verbose = false
  }

  async ensureDir(path: string) {
    await this.client.ensureDir(path)
  }

  async connect(options: {
    host: string
    user?: string
    password?: string
    port?: number
  }) {
    await this.client.access({
      host: options.host,
      port: options.port || 21,
      user: options.user,
      password: options.password,
      secure: false,
    })
  }

  async downloadFile(remotePath: string, localPath: string) {
    await this.client.downloadTo(localPath, remotePath)
  }

  async rename(oldPath: string, newPath: string) {
    await this.client.rename(oldPath, newPath)
  }

  close() {
    this.client.close()
  }
}

export function createFtpClient(origin: string): IFTPClient {
  if (origin.toLowerCase() === 'sftp') {
    return new SftpClientService()
  }
  return new BasicFtpClientService()
}
