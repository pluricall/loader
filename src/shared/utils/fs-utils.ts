import fs from "fs";
import path from "path";

export function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

export function copyFilesToLocal(
  files: { file_path: string; file_name: string }[],
  destDir: string,
) {
  ensureDir(destDir);

  for (const file of files) {
    try {
      const src = file.file_path;
      const dest = path.join(destDir, file.file_name);
      fs.copyFileSync(src, dest);
    } catch (e: any) {
      console.error(`❌ Erro ao copiar ${file.file_name}: ${e.message}`);
    }
  }
}
