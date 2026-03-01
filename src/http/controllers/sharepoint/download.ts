import client from "../../../shared/infra/db/sharePointConnection";

export async function downloadFromSharepoint(
  driveId: string,
  filePath: string,
): Promise<Buffer> {
  try {
    const response = await client
      .api(`/drives/${driveId}/root:/${filePath}:/content`)
      .responseType("arraybuffer")
      .get();

    return Buffer.from(response);
  } catch (err: any) {
    console.error("Erro ao baixar arquivo do SharePoint:", err);
    throw new Error(`Não foi possível baixar '${filePath}' do SharePoint`);
  }
}
