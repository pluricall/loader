interface IFieldRequest<T> {
  RequestType?: string
  Value?: T
}

export interface IContactsResubmitRequest {
  AgentName?: IFieldRequest<string>
  BusinessStatus?: IFieldRequest<string>
  ContactListName?: IFieldRequest<string>
  ContactStatus?: IFieldRequest<string>
  ForcePowerDial?: IFieldRequest<boolean>
  ManualRescheduleTimeLimit?: IFieldRequest<string>
  ManualScheduleMoment?: IFieldRequest<string>
  OutboundRuleName?: IFieldRequest<string>
  Priority?: IFieldRequest<number>
  SkillProfileName?: IFieldRequest<string>
  UsesDoNotCallList?: IFieldRequest<boolean>

  discriminator: string
  NTriesAuto: boolean
  NTriesManual: boolean
  ResubmitAdditionalPhone1: boolean
  ResubmitAdditionalPhone2: boolean
  ResubmitAdditionalPhone3: boolean
  ResubmitAdditionalPhone4: boolean
  ResubmitAdditionalPhone5: boolean
  ResubmitAdditionalPhone6: boolean
  ResubmitAdditionalPhone7: boolean
  ResubmitAdditionalPhone8: boolean
  ResubmitAdditionalPhone9: boolean
  ResubmitAdditionalPhone10: boolean
  ResubmitAdditionalPhone11: boolean
  ResubmitAdditionalPhone12: boolean
  ResubmitAdditionalPhone13: boolean
  ResubmitAdditionalPhone14: boolean
  ResubmitAdditionalPhone15: boolean
  ResubmitBusinessPhone: boolean
  ResubmitHomePhone: boolean
  ResubmitInvalidPhones: boolean
  ResubmitMobilePhone: boolean
  ResubmitOtherPhone: boolean
  ResubmitReschedulePhone: boolean
}

export interface IContactsResubmitBody {
  discriminator: string
  campaignName?: string
  sql?: string
  request?: IContactsResubmitRequest
}
