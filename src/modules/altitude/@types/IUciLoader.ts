import { EntityNameEnum, LoadingModeEnum } from "@prisma/client";

export interface IUciLoaderBody {
  separator: string;
  entityName: EntityNameEnum;
  loadingMode: LoadingModeEnum;
  fields: string[];
  fixedFields: Record<string, string | number> | any;
}
