import fs from 'fs/promises'
import { existsSync } from 'fs'
import path from 'path'

export class FileService {
  async download(source: any, destinationPath: string) {
    const originalPath = source.full_url || source.local_path
    await fs.copyFile(originalPath, destinationPath)
    return { filePath: destinationPath }
  }

  async moveFile(source: any, originalPath: string, newPath: string) {
    const dir = path.dirname(newPath)
    await fs.mkdir(dir, { recursive: true })
    await fs.rename(originalPath, newPath)
  }

  async createDirectoryIfNotExists(folder: string) {
    if (!existsSync(folder)) {
      await fs.mkdir(folder, { recursive: true })
    }
  }

  async readFile(filePath: string): Promise<Buffer> {
    return await fs.readFile(filePath)
  }

  async deleteFile(filePath: string) {
    if (existsSync(filePath)) {
      await fs.unlink(filePath)
    }
  }

  getTempFolder(options: {
    baseDirectory: string
    subFolder?: string
  }): string {
    const { baseDirectory, subFolder } = options
    return path.resolve(baseDirectory, subFolder || '')
  }
}
