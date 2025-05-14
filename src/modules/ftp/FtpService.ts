import { SourceBD } from '@prisma/client'
import { createFtpClient } from './utils/ClientService'
import path from 'path'
import { CustomError } from '../../errors/error'

export class FtpService {
  private getClient(origin: string) {
    return createFtpClient(origin)
  }

  async download(source: SourceBD, destinationPath: string) {
    const client = this.getClient(source.origin)
    try {
      console.log(
        `Conectando ao ${source.origin.toUpperCase()}: ${source.host}`,
      )

      if (!source.host || !source.username || !source.password) {
        throw new CustomError(
          'Algum campo de conexão com o FTP/SFTP está vazio!',
          400,
        )
      }

      await client.connect({
        host: source.host,
        port: source.port ?? (source.origin === 'ftp' ? 21 : 22),
        user: source.username,
        password: source.password,
      })

      if (!source.full_url || source.full_url.trim() === '') {
        throw new CustomError('A URL completa (full_url) está vazia', 400)
      }

      const url = new URL(source.full_url)
      const filePath = decodeURIComponent(url.pathname)
      await client.downloadFile(filePath, destinationPath)
      console.log(`Arquivo salvo em: ${destinationPath}`)

      return { client, filePath }
    } catch (error: any) {
      console.log(`Erro: ${error.message}`)
      throw error
    }
  }

  async moveFile(source: SourceBD, originalPath: string, targetPath: string) {
    const client = this.getClient(source.origin)
    try {
      if (!source.host || !source.username || !source.password) {
        throw new CustomError(
          'Algum campo de conexão com o FTP/SFTP está vazio!',
          400,
        )
      }

      await client.connect({
        host: source.host,
        port: source.port ?? (source.origin === 'ftp' ? 21 : 22),
        user: source.username,
        password: source.password,
      })

      const targetDir = path.posix.dirname(targetPath)

      await client.ensureDir(targetDir)

      await client.rename(originalPath, targetPath)
    } catch (error: any) {
      console.log(`Erro: ${error.message}`)
      throw error
    } finally {
      client.close()
    }
  }
}

export const ftpServiceInstance = new FtpService()
