export interface IAttribute {
  Name: string;
  Value: string | number;
}

export interface ICreateContactBody {
  contactListName: string;
  attributes: IAttributeContact;
  contactProfileId?: string;
  reschedulePhone?: string;
  campaignName: string;
  directoryId?: string;
}

export interface ICreateContact {
  campaignName: string;
  contactCreateRequest: {
    Status: string;
    DirectoryName: { Value: string };
    Attributes: IAttribute[];
    ContactListName: { Value: string };
    TimeZoneName: { Value: string };
    discriminator?: string;
  };
  discriminator?: string;
}
