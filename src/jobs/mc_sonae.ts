import cron from 'node-cron'
import { LoadService } from '../modules/load/LoadService'
import { FastifyInstance } from 'fastify'
import { AltitudeService } from '../modules/altitude/AltitudeService'

const loadService = new LoadService()
const altitudeService = new AltitudeService()

const CAMPAIGN_ID = '98a197d8-6315-48e5-9c66-19616f567330'

export async function McSonaeJobs(fastify: FastifyInstance) {
  fastify.log.info('🔁 Execução manual do cron job UCI iniciada...')
  
  cron.schedule('30 11 * * *', async () => {
    fastify.log.info('⏰ Cron job disparado para processar carga UCI...')
    const today = new Date().toISOString().split('T')[0]


    try {
      await altitudeService.resubmitContacts({
        campaignName: 'MC_Sonae_Cob',
        sql: "WHERE ContactListName = '2025' AND InteractionStatus = 'Started' ",
        request: {
          ContactStatus: {
            RequestType: 'Set',
            Value: 'Done',
          },
          ResubmitHomePhone: false,
          ResubmitBusinessPhone: false,
          ResubmitMobilePhone: false,
          ResubmitOtherPhone: false,
          ResubmitAdditionalPhone1: false,
          ResubmitAdditionalPhone2: false,
          ResubmitAdditionalPhone3: false,
          ResubmitAdditionalPhone4: false,
          ResubmitAdditionalPhone5: false,
          ResubmitAdditionalPhone6: false,
          ResubmitAdditionalPhone7: false,
          ResubmitAdditionalPhone8: false,
          ResubmitAdditionalPhone9: false,
          ResubmitAdditionalPhone10: false,
          ResubmitAdditionalPhone11: false,
          ResubmitAdditionalPhone12: false,
          ResubmitAdditionalPhone13: false,
          ResubmitAdditionalPhone14: false,
          ResubmitAdditionalPhone15: false,
          ResubmitReschedulePhone: false,
          ResubmitInvalidPhones: false,
          NTriesAuto: false,
          NTriesManual: false,
          discriminator: '',
        },
        discriminator: '',
      })
      fastify.log.info('✅ Resubmit de contatos finalizado com sucesso.')
    } catch (err: any) {
      fastify.log.error(`Erro ao executar o resubmit de contatos: ${err.message}`)
    }

    try {
      await loadService.uciLoaderCampaignById(CAMPAIGN_ID)
      fastify.log.info('✅ Carga UCI finalizada com sucesso.')
    } catch (err: any) {
      fastify.log.error(`Erro ao rodar a carga UCI: ${err}`)
    }
  })

  fastify.log.info(
    '🚀 Cron job de carga UCI agendado para rodar todos os dias às 11h30.',
  )
}
