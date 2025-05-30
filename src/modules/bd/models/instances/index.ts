import { prisma } from '../../../../config/prisma'
import { CampaignModel } from '../CampaignModel'
import { SourceModel } from '../SourceModel'
import { TypModel } from '../TypModel'

export const campaignModelInstance = new CampaignModel(prisma)

export const sourceModelInstance = new SourceModel(prisma)

export const typModelInstance = new TypModel(prisma)
