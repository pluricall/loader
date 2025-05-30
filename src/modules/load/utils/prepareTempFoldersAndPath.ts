import path from 'path'
import { FileService } from '../../file/FileService'
import { Campaign, SourceBD } from '@prisma/client'

export async function prepareTempFolderAndPaths(
  campaign: Campaign,
  source: SourceBD,
) {
  const campaignName = campaign.name
  const now = new Date()
  const dateStr = now
    .toISOString()
    .replace(/[-:T.]/g, '')
    .slice(0, 15)
  const uniqueId = `${dateStr}_${campaignName}`

  const tempFolder = path.resolve(process.cwd(), 'loads', uniqueId)

  const fileService = new FileService()
  fileService.createDirectoryIfNotExists(tempFolder)

  const datFileName = source.local_path
    ? path.basename(source.local_path)
    : 'source.dat'
  const datDestinationPath = path.join(tempFolder, datFileName)

  return { tempFolder, datDestinationPath }
}
