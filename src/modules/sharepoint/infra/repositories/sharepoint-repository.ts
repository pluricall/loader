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

  async getFolders(
    driveId: string,
    folderPath = "",
    visited = new Set<string>(),
  ): Promise<Folder[]> {
    const apiPath = folderPath
      ? `/drives/${driveId}/root:/${folderPath}:/children`
      : `/drives/${driveId}/root/children`;

    const res = await client.api(apiPath).get();

    const folders = res.value.filter((item: any) => item.folder);

    let result: Folder[] = [];

    for (const folder of folders) {
      const currentPath = folderPath
        ? `${folderPath}/${folder.name}`
        : folder.name;

      if (visited.has(currentPath)) continue;
      visited.add(currentPath);

      result.push({
        name: folder.name,
        path: currentPath,
        hasChildren: folder.folder.childCount > 0,
      });

      const children = await this.getFolders(driveId, currentPath, visited);

      result = result.concat(children);
    }

    return result;
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
