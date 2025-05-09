import cron from 'node-cron'
import { LoadService } from '../modules/load/LoadService'
import { altitudeServiceInstance } from '../modules/altitude/instances/AltitudeServiceInstance'
import { loaderTaskModelInstance } from '../modules/bd/models/instances'
import { FastifyInstance } from 'fastify'

const loadService = new LoadService(
  undefined,
  undefined,
  loaderTaskModelInstance,
)

const CAMPAIGN_ID = '7f1b16ca-8eb9-4e12-bc1e-8955cc88deaa'

export async function McSonaeJobs(fastify: FastifyInstance) {
  cron.schedule('57 15 * * *', async () => {
    fastify.log.info('⏰ Cron job disparado para processar carga UCI...')
    const today = new Date().toISOString().split('T')[0]
    try {
      await altitudeServiceInstance.resubmitContacts({
        campaignName: 'mc_sonae_cob',
        sql: `WHERE dataload = '${today}'`,
        request: {
          ContactStatus: {
            RequestType: 'Ignore',
            Value: 'Disabled',
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
      await loadService.uciLoaderCampaignById(CAMPAIGN_ID)
      fastify.log.info('✅ Carga UCI finalizada com sucesso.')
    } catch (err: any) {
      fastify.log.error(`Erro ao rodar o cron job de carga UCI: ${err.message}`)
    }
  })

  fastify.log.info(
    '🚀 Cron job de carga UCI agendado para rodar todos os dias às 15h55.',
  )
}
