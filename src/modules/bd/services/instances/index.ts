import {
  campaignModelInstance,
  sourceModelInstance,
  typModelInstance,
} from '../../models/instances'
import { CampaignService } from '../CampaignService'
import { SourceService } from '../SourceService'
import { TypService } from '../TypService'

export const campaignServiceInstance = new CampaignService(
  campaignModelInstance,
)

export const typServiceInstance = new TypService(typModelInstance)

export const sourceServiceInstance = new SourceService(
  campaignModelInstance,
  sourceModelInstance,
  typModelInstance,
)
