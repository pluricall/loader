import client from "../db/sharePointConnection";

export async function folderHierarchy(driveId: string, path: string) {
  const partes = path.split("/");
  let currentPath = "";

  for (const parte of partes) {
    currentPath += `/${parte}`;
    try {
      // Verifica se a pasta já existe
      await client.api(`/drives/${driveId}/root:${currentPath}`).get();
    } catch {
      // Cria a pasta dentro do caminho acumulado
      await client.api(`/drives/${driveId}/root:${currentPath}`).put({
        name: parte,
        folder: {},
        "@microsoft.graph.conflictBehavior": "rename",
      });
    }
  }
}
