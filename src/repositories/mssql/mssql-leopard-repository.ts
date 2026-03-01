import { connectLeopardDb } from "../../shared/infra/db/connect-leopard";

export interface RecordingFile {
  rec_key: string;
  time_stamp: string;
  rec_time: string;
  file_size: number;
}

export class LeopardRepository {
  async fetchRecordingFiles(recKeys: string[]): Promise<RecordingFile[]> {
    const pool = await connectLeopardDb("avr8");

    const chunkSize = 500;
    const allResults: RecordingFile[] = [];

    for (let i = 0; i < recKeys.length; i += chunkSize) {
      const chunk = recKeys.slice(i, i + chunkSize);
      const keys = chunk.map((key) => `'${key}'`).join(",");

      const result = await pool.query(`
        SELECT rec_key, time_stamp, rec_time, file_size
        FROM recording
        WHERE rec_key IN (${keys})
      `);

      allResults.push(...result.recordset);
    }

    return allResults;
  }
}
