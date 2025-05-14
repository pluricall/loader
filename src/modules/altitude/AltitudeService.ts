import { resubmitContacts } from './methods/ResubmitContacts'
import { createContact } from './methods/CreateContact'
import { getDirectoryIdByCampaignName } from './methods'
import { env } from '../../env'
import { uAgentWeb } from '../../config/axios'
import {
  IContactsResubmitBody,
  ICreateContact,
  IDirectoryIdByCampaignName,
} from './@types'
import {
  BackgroundTaskResult,
  getBackgroundTask,
} from './methods/BackgroundTask'

export class AltitudeService {
  private token: string | null = null
  private apiVersion: string

  constructor() {
    this.apiVersion = env.UAGENT_WEB_API_VERSION || '8.6.2000'
  }

  private async authenticate() {
    try {
      const bodyRequest = new URLSearchParams({
        username: 'rgsm',
        password: 'Neiajonas123?',
        grant_type: 'password',
        instanceaddress: '172.30.226.5:1500',
        secureaccess: 'false',
        authenticationType: 'Uci',
        forced: 'true',
        operation: 'login',
      })
      const response = await uAgentWeb.post('/token', bodyRequest, {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      })
      this.token = response.data.access_token

      return this.token
    } catch (error) {
      console.error('Erro na autenticação:', error)
      return null
    }
  }

  async createContact(payload: ICreateContact) {
    if (!this.token) await this.authenticate()
    return await createContact(payload, this.token!, this.apiVersion)
  }

  async getDirectoryId({ campaignName }: IDirectoryIdByCampaignName) {
    if (!this.token) await this.authenticate()
    return await getDirectoryIdByCampaignName(
      { campaignName },
      this.token!,
      this.apiVersion,
    )
  }

  async resubmitContacts(payload: IContactsResubmitBody) {
    if (!this.token) await this.authenticate()
    return await resubmitContacts(payload, this.token!, this.apiVersion)
  }

  async getBackgroundTaskData(taskId: string): Promise<BackgroundTaskResult> {
    if (!this.token) await this.authenticate()
    return await getBackgroundTask(taskId, this.token!, this.apiVersion)
  }
}
