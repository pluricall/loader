import client from "../../../../shared/infra/providers/sharepoint/sharepoint-client";
import { Drive } from "../../domain/entities/drive";
import { Folder } from "../../domain/entities/folder";
import { Site } from "../../domain/entities/site";
import { ISharepointRepository } from "../../domain/repositories/sharepoint-repository";
import { ResponseType } from "@microsoft/microsoft-graph-client";

export class SharepointRepository implements ISharepointRepository {
  async getSites(): Promise<Site[]> {
    const res = await client.api("/sites?search=*").get();
    return res.value
      .filter((s: any) => s.displayName.toLowerCase().startsWith("cliente"))
      .map((s: any) => ({ id: s.id, displayName: s.displayName }));
  }

  async getDrives(siteId: string): Promise<Drive[]> {
    const res = await client.api(`/sites/${siteId}/drives`).get();
    return res.value.map((d: any) => ({ id: d.id, name: d.name }));
  }

  async getFolders(driveId: string, folderPath = ""): Promise<Folder[]> {
    const apiPath = folderPath
      ? `/drives/${driveId}/root:/${folderPath}:/children`
      : `/drives/${driveId}/root/children`;

    const res = await client.api(apiPath).get();
    return res.value
      .filter((item: any) => item.folder)
      .map((folder: any) => ({
        name: folder.name,
        path: folderPath ? `${folderPath}/${folder.name}` : folder.name,
        hasChildren: folder.folder.childCount > 0,
      }));
  }

  async downloadFile(driveId: string, filePath: string): Promise<Buffer> {
    const response = await client
      .api(`/drives/${driveId}/root:/${filePath}:/content`)
      .responseType(ResponseType.ARRAYBUFFER)
      .get();
    return Buffer.from(response);
  }

  async uploadFile({
    driveId,
    filePath,
    fileBuffer,
  }: {
    driveId: string;
    filePath: string;
    fileBuffer: Buffer;
  }): Promise<void> {
    await client
      .api(`/drives/${driveId}/root:/${filePath}:/content`)
      .put(fileBuffer);
  }
}
