import { uAgentWeb } from "../../../config/axios";
import { IDirectoryIdByCampaignName } from "../@types";

export async function getDirectoryIdByCampaignName(
  { campaignName }: IDirectoryIdByCampaignName,
  token: string,
  apiVersion: string,
) {
  const response = await uAgentWeb.get(
    `/instance/campaigns/name/${campaignName}/directories?api-version=${apiVersion}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );

  return response.data.Id;
}
