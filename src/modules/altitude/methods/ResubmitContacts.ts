import { uAgentWeb } from '../../../config/axios'
import { IContactsResubmitBody } from '../@types'

export async function resubmitContacts(
  body: IContactsResubmitBody,
  token: string,
  apiVersion: string,
) {
  const response = await uAgentWeb.put(
    `/api/instance/campaignManager/resubmitContacts`,
    body,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        'api-version': apiVersion,
      },
    },
  )

  return response.data
}
