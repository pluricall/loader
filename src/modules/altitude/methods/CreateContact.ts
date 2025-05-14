import { uAgentWeb } from '../../../config/axios'
import { ICreateContact } from '../@types'

export async function createContact(
  { campaignName, contactCreateRequest, discriminator = '' }: ICreateContact,
  token: string,
  apiVersion: string,
) {
  const attributesData = contactCreateRequest.Attributes.map((attr) => ({
    Name: attr.Name,
    Value: attr.Value,
  }))

  const payload = {
    discriminator,
    campaignName,
    contactCreateRequest: {
      ...contactCreateRequest,
      Attributes: attributesData,
    },
  }

  const response = await uAgentWeb.post(
    `/api/instance/campaignManager/createContact?api-version=${apiVersion}`,
    payload,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  )

  return response
}
