import { IFileService } from "../../domain/interfaces/IFileService";
import fs from "fs";
import path from "path";
import csv from "csv-parser";
import iconv from "iconv-lite";

export class FileService implements IFileService {
  private detectEncoding(filePath: string): "utf-8" | "utf-16le" {
    const buffer = Buffer.alloc(2);
    const fd = fs.openSync(filePath, "r");
    fs.readSync(fd, buffer, 0, 2, 0);
    fs.closeSync(fd);

    if (buffer[0] === 0xff && buffer[1] === 0xfe) return "utf-16le";
    return "utf-8";
  }

  private detectDelimiter(filePath: string, sampleLines = 5): string {
    const content = fs.readFileSync(filePath, "utf-8");
    const lines = content.split(/\r?\n/).slice(0, sampleLines);

    const delimiters = [",", ";", "\t"];
    let bestDelimiter = delimiters[0];
    let maxCount = 0;

    for (const delimiter of delimiters) {
      const count = lines
        .map((line) => line.split(delimiter).length - 1)
        .reduce((a, b) => a + b, 0);

      if (count > maxCount) {
        maxCount = count;
        bestDelimiter = delimiter;
      }
    }

    return bestDelimiter;
  }

  async exists(path: string): Promise<boolean> {
    return fs.existsSync(path);
  }

  async parseCSV(path: string): Promise<any[]> {
    const detectedEncoding = this.detectEncoding(path);
    const detectedDelimiter = this.detectDelimiter(path);
    return new Promise((resolve, reject) => {
      const results: any[] = [];

      fs.createReadStream(path)
        .pipe(iconv.decodeStream(detectedEncoding))
        .pipe(csv({ separator: detectedDelimiter }))
        .on("data", (data) => results.push(data))
        .on("end", () => resolve(results))
        .on("error", reject);
    });
  }

  async createFolder(folderPath: string): Promise<void> {
    if (!fs.existsSync(folderPath)) {
      fs.mkdirSync(folderPath, { recursive: true });
    }
  }

  async moveFile(from: string, to: string): Promise<void> {
    const destFolder = path.dirname(to);

    await this.createFolder(destFolder);

    try {
      fs.renameSync(from, to);
    } catch (err: any) {
      if (err.code === "EXDEV") {
        fs.copyFileSync(from, to);
        fs.unlinkSync(from);
      } else {
        throw err;
      }
    }
  }
}
