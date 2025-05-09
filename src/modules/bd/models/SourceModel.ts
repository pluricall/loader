import { PrismaClient } from '@prisma/client'
import {
  SourceBodyRequest,
  SourceBodyUpdateRequest,
} from '../schemas/SourceSchema'

export class SourceModel {
  constructor(private prisma: PrismaClient) {}

  private generateFullUrl(
    data: SourceBodyRequest | SourceBodyUpdateRequest,
  ): string | null {
    if (data.origin === 'ftp' || data.origin === 'sftp') {
      const host = data.host
      const port = data.port || (data.origin === 'ftp' ? 21 : 22)
      const username = data.username
      const password = data.password
      const localPath = data.localPath ? `/${data.localPath}` : ''

      if (data.origin === 'ftp') {
        return `ftp://${username}:${password}@${host}:${port}${localPath}`
      }

      if (data.origin === 'sftp') {
        return `sftp://${username}:${password}@${host}:${port}${localPath}`
      }
    }

    if (data.origin === 'directory') {
      return data.localPath
    }

    return null
  }

  async create(data: SourceBodyRequest) {
    return this.prisma.sourceBD.create({
      data: {
        origin: data.origin,
        name: data.name,
        host: data.origin === 'directory' ? null : data.host,
        port: data.origin === 'directory' ? null : data.port,
        username: data.origin === 'directory' ? null : data.username,
        password: data.origin === 'directory' ? null : data.password,
        local_path: data.origin === 'directory' ? data.localPath : null,
        frequency: data.frequency,
        full_url: this.generateFullUrl(data),
        day_of_month: data.dayOfMonth,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        interval: data.interval,
        campaign_id: data.campaignId,
        created_by: 'rgsm',
        typ_id: data.typId ?? null,
      },
    })
  }

  async getById(id: string) {
    return this.prisma.sourceBD.findUnique({
      where: { id },
      include: {
        typ: true,
      },
    })
  }

  async getByName(name: string, campaignId: string) {
    return this.prisma.sourceBD.findFirst({
      where: {
        name,
        campaign_id: campaignId,
      },
    })
  }

  async update(id: string, data: SourceBodyUpdateRequest) {
    return this.prisma.sourceBD.update({
      where: { id },
      data: {
        origin: data.origin,
        name: data.name,
        host: data.origin === 'directory' ? null : data.host,
        port: data.origin === 'directory' ? null : data.port,
        username: data.origin === 'directory' ? null : data.username,
        password: data.origin === 'directory' ? null : data.password,
        local_path: data.origin === 'directory' ? data.localPath : null,
        frequency: data.frequency,
        full_url: this.generateFullUrl(data),
        day_of_month: data.dayOfMonth,
        day_of_week: data.dayOfWeek,
        start_time: data.startTime,
        end_time: data.endTime,
        typ_id: data.typId ?? null,
        interval: data.interval,
        updated_at: new Date(),
      },
    })
  }

  async delete(id: string) {
    return this.prisma.sourceBD.delete({
      where: { id },
    })
  }

  async updateTyp(sourceId: string, typId: string) {
    return this.prisma.sourceBD.update({
      where: { id: sourceId },
      data: {
        typ_id: typId,
        updated_at: new Date(),
      },
    })
  }

  async sourceOrigin() {
    return this.prisma.sourceBD.findFirst({
      where: {
        origin,
      },
    })
  }
}
