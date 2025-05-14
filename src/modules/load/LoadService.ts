import path from 'path'
import { CampaignModel } from '../bd/models/CampaignModel'
import {
  campaignModelInstance,
  loaderTaskModelInstance,
} from '../bd/models/instances'
import { UciLoaderService } from '../altitude/UciLoaderService'
import { uciLoaderServiceInstance } from '../altitude/instances/UciLoaderServiceInstance'
import { FtpService } from '../ftp/FtpService'
import { waitForTaskCompletion } from './utils/waitForTaskCompletion'
import { prepareTempFolderAndPaths } from './utils/prepareTempFoldersAndPath'
import { CustomError } from '../../errors/error'
import { FileService } from '../file/FileService'
import { sendEmail } from '../../config/send-email'
import { LoaderTaskModel } from '../bd/models/LoaderTaskModel'

export class LoadService {
  constructor(
    private readonly CampaignModel: CampaignModel = campaignModelInstance,
    private readonly uciLoaderService: UciLoaderService = uciLoaderServiceInstance,
    private readonly loaderTaskModel: LoaderTaskModel = loaderTaskModelInstance,
  ) {}

  async uciLoaderCampaignById(campaignId: string) {
    let typPath: string | null = null
    let datPath: string | null = null
    let campaignName: string | null = null

    try {
      const campaign = await this.CampaignModel.getById(campaignId)
      campaignName = campaign?.name ?? null
      if (!campaign?.sources?.length) {
        throw new CustomError(
          'Nenhum source encontrado para esta campanha.',
          404,
        )
      }

      const source = campaign.sources[0]
      if (!source.typ) {
        throw new CustomError('O source não possui typ vinculado.', 400)
      }

      const { tempFolder, datDestinationPath } =
        await prepareTempFolderAndPaths(campaign, source)

      datPath = datDestinationPath

      let originalPath
      if (source.origin === 'ftp' || source.origin === 'sftp') {
        const ftpService = new FtpService()
        originalPath = await ftpService.download(source, datDestinationPath)
      } else if (source.origin === 'directory') {
        const localService = new FileService()
        originalPath = await localService.download(source, datDestinationPath)
      } else {
        throw new CustomError(
          `Tipo de origem '${source.origin}' não suportado.`,
          400,
        )
      }

      typPath = await this.uciLoaderService.generateTypFile({
        entityName: source.typ.entityName,
        fields: source.typ.fields,
        fixedFields: source.typ.fixed_fields,
        loadingMode: source.typ.loadingMode,
        parserMode: source.typ.parserMode,
        separator: source.typ.separator,
        outputPath: path.join(
          tempFolder,
          `${path.parse(datDestinationPath).name}.typ`,
        ),
      })

      const taskId = await this.uciLoaderService.runUciLoader(typPath, datPath)
      const resultOfTask = await waitForTaskCompletion(taskId)

      const fileName = `${resultOfTask.CreationMoment}_${resultOfTask.Id}.dat`
      const carregadosDir = path.join(
        path.dirname(originalPath.filePath),
        'CARREGADOS',
      )

      const newFilePath = path.join(carregadosDir, fileName).replace(/\\/g, '/')

      if (source.origin === 'ftp' || source.origin === 'sftp') {
        const ftpService = new FtpService()
        await ftpService.moveFile(source, originalPath.filePath, newFilePath)
      } else if (source.origin === 'directory') {
        const localService = new FileService()
        await localService.moveFile(source, originalPath.filePath, newFilePath)
      }

      await this.loaderTaskModel.create({
        task_id: resultOfTask.Id,
        status: resultOfTask.Status,
        status_description: resultOfTask.StatusDescription || '',
        percentage_done: resultOfTask.PercentageDone,
        creation_moment: new Date(resultOfTask.CreationMoment),
        start_moment: new Date(resultOfTask.StartMoment),
        end_moment: new Date(resultOfTask.EndMoment),
        internal: resultOfTask.Internal
          ? JSON.stringify(resultOfTask.Internal)
          : null,
      })
      return {
        resultTask: resultOfTask,
      }
    } catch (error: any) {
      console.error('❌ Erro na carga UCI:', error.message)

      const failedFiles = [typPath, datPath].filter(Boolean) as string[]
      if (failedFiles.length) {
        try {
          await sendEmail(failedFiles, campaignName)
        } catch (emailErr) {
          console.warn('⚠️ Falha ao enviar e-mail com arquivos:', emailErr)
        }
      }

      throw error
    }
  }
}
