export interface IFTPClient {
  connect(options: {
    host: string
    user?: string
    password?: string
    port?: number
  }): Promise<void>
  downloadFile(remotePath: string, localPath: string): Promise<void>
  rename(oldPath: string, newPath: string): Promise<void>
  ensureDir(path: string): Promise<void>
  close(): void
}
