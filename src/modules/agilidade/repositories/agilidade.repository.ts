export interface InsertAtAgilidadeLeadsRepository {
  requestIp: any;
  requestUrl: any;
  genId: any;
  campanhaEasy: any;
  contactList: any;
  bd: any;
  mappingTemplate: any;
  rawPhoneNumber: any;
  phoneNumber: any;
  leadStatus: "RECEIVED" | "LOADED" | "ERROR";
  nome: any;
  email: any;
  leadId: any;
  distId: any;
  createdDate: any;
  postedDate: any;
  city: any;
  adId: any;
  adsetId: any;
  campaignId: any;
  adName: any;
  campaignName: any;
  adsetName: any;
  formId: any;
  formData: any;
}

export interface AgilidadeRepository {
  insertAtLeadsRepository: (
    data: InsertAtAgilidadeLeadsRepository,
  ) => Promise<void>;
  updateLeadStatus: (gen_id: string, lead_status: string) => Promise<void>;
}
