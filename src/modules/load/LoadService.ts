import path from 'path'
import { UciLoaderService } from '../altitude/UciLoaderService'
import { uciLoaderServiceInstance } from '../altitude/instances/UciLoaderServiceInstance'
import { FtpService } from '../ftp/FtpService'
import { waitForTaskCompletion } from './utils/waitForTaskCompletion'
import { prepareTempFolderAndPaths } from './utils/prepareTempFoldersAndPath'
import { CustomError } from '../../errors/error'
import { FileService } from '../file/FileService'
import { sendEmail } from '../../config/send-email'
import { CampaignService } from '../bd/services/CampaignService'
import { campaignServiceInstance } from '../bd/services/instances'
import { IFTPClient } from '../ftp/utils/IFtpClient'

export class LoadService {
  constructor(
    private readonly campaignService: CampaignService = campaignServiceInstance,
    private readonly uciLoaderService: UciLoaderService = uciLoaderServiceInstance,
  ) {}

  async uciLoaderCampaignById(campaignId: string) {
    let typPath: string | null = null
    let datPath: string | null = null
    let originalPath: { filePath: string; client?: IFTPClient }
    let campaignName = 'Campanha não identificada'

    try {
      const campaign = await this.campaignService.getById(campaignId)
      campaignName = campaign?.name || campaignName

      if (!campaign?.sources.length) {
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

      switch (source.origin) {
        case 'ftp':
        case 'sftp': {
          const ftpService = new FtpService()
          originalPath = await ftpService.getFile(source, datDestinationPath)
          break
        }
        case 'directory': {
          const localService = new FileService()
          originalPath = await localService.download(source, datDestinationPath)
          break
        }
        default:
          throw new CustomError(
            `Tipo de origem '${source.origin}' não suportado.`,
            400,
          )
      }

      typPath = await this.uciLoaderService.createTyp({
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

      const taskId = await this.uciLoaderService.runningUciLoader(
        typPath,
        datPath,
      )
      const resultOfTask = await waitForTaskCompletion(taskId)
      await this.uciLoaderService.saveLoaderTask(resultOfTask)

      const warningDetected =
        resultOfTask.Status === 'Completed' &&
        (resultOfTask.StatusDescription?.toLowerCase().includes(
          'rows were rejected',
        ) ||
          (Array.isArray(resultOfTask.Internal) &&
            resultOfTask.Internal.includes(
              'LPTS_TASK_AUX_STATUS_DAT_LINES_DISCARDED',
            )))

      if (warningDetected) {
        const filesWithWarning = [typPath, datPath].filter(Boolean) as string[]
        try {
          await sendEmail({
            campaignName,
            files: filesWithWarning,
            title: 'Linhas rejeitadas no loader',
            errors:
              resultOfTask.StatusDescription || 'Linhas rejeitadas no loader.',
          })
        } catch (emailErr) {
          console.warn('⚠️ Falha ao enviar e-mail de aviso:', emailErr)
        }
      }

      const newFileName = `${resultOfTask.CreationMoment}_${resultOfTask.Id}.dat`
      const moveNewFileNameToFileCarregados = path.join(
        path.dirname(originalPath.filePath),
        'CARREGADOS',
      )

      const newFilePath = path
        .join(moveNewFileNameToFileCarregados, newFileName)
        .replace(/\\/g, '/')

      switch (source.origin) {
        case 'ftp':
        case 'sftp': {
          const ftpService = new FtpService()
          await ftpService.moveFile(source, originalPath.filePath, newFilePath)
          break
        }
        case 'directory': {
          const localService = new FileService()
          await localService.moveFile(
            source,
            originalPath.filePath,
            newFilePath,
          )
          break
        }
      }

      try {
        await sendEmail({
          campaignName,
          title: `✅ Carga ${campaignName} concluída!`,
          errors: 'A carga foi concluída sem erros.',
        })
      } catch (emailErr) {
        console.warn('⚠️ Falha ao enviar e-mail de sucesso:', emailErr)
      }

      return { resultTask: resultOfTask }
    } catch (error: any) {
      console.error('❌ Erro na carga UCI:', error.message)

      const failedFiles = [typPath, datPath].filter(Boolean) as string[]
      try {
        await sendEmail({
          campaignName,
          files: failedFiles,
          title: '❌ Erro na carga UCI',
          errors: error.message || String(error),
        })
      } catch (emailErr) {
        console.warn('⚠️ Falha ao enviar e-mail com erro:', emailErr)
      }
      throw error
    }
  }
}
