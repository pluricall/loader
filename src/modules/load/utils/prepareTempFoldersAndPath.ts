import path from "path";
import { FileService } from "../../file/FileService";
import { Source } from "@prisma/client";

export async function prepareTempFolderAndPaths(source: Source) {
  const now = new Date();
  const dateStr = now
    .toISOString()
    .replace(/[-:T.]/g, "")
    .slice(0, 15);
  const uniqueId = `${dateStr}_`;

  const tempFolder = path.resolve(process.cwd(), "loads", uniqueId);

  const fileService = new FileService();
  fileService.createDirectoryIfNotExists(tempFolder);

  const datFileName = source.local_path
    ? path.basename(source.local_path)
    : "source.dat";
  const datDestinationPath = path.join(tempFolder, datFileName);

  return { tempFolder, datDestinationPath };
}
