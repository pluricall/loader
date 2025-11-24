import { DownloadSharepointRecordingUseCase } from "../../../use-cases/recordings/download-sharepoint-recording";
import { connectPumaDb } from "../../../db/connect-puma";
import { FastifyReply, FastifyRequest } from "fastify";
import JSZip from "jszip";

interface DownloadQuery {
  easycode: string;
}

export async function downloadRecording(
  req: FastifyRequest<{ Querystring: DownloadQuery }>,
  reply: FastifyReply,
) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith("Basic ")) {
      return reply.status(401).send({ error: "Missing Authorization header" });
    }

    const base64Credentials = authHeader.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString(
      "utf-8",
    );
    const [email, password] = credentials.split(":");
    if (!email || !password) {
      return reply.status(401).send({ error: "Invalid Authorization format" });
    }

    const pool = await connectPumaDb("easy8");
    const result = await pool.request().input("email", email).query(`
      SELECT id, password_hash, status
      FROM insight_clients_login
      WHERE email = @email
    `);
    const client = result.recordset[0];
    if (!client || client.status !== "ACTIVO") {
      return reply.status(401).send({ error: "Usuário inválido ou inativo" });
    }

    const bcrypt = await import("bcryptjs");
    const isPasswordValid = await bcrypt.compare(
      password,
      client.password_hash,
    );
    if (!isPasswordValid) {
      return reply.status(401).send({ error: "Senha incorreta" });
    }

    // --- Busca gravações ---
    const { easycode } = req.query;
    const useCase = new DownloadSharepointRecordingUseCase();
    const recordings = await useCase.execute("2", easycode);

    if (!recordings.length) {
      return reply.status(404).send({ error: "Nenhuma gravação encontrada" });
    }

    // --- Cenário 1: apenas 1 gravação ---
    if (recordings.length === 1) {
      const r = recordings[0];
      return reply
        .header("Content-Type", "audio/wav")
        .header("Content-Disposition", `attachment; filename="${r.fileName}"`)
        .send(r.buffer);
    }

    // --- Cenário 2: mais de uma gravação, ZIP ---
    const zip = new JSZip();
    recordings.forEach((r) => {
      // garante que cada arquivo dentro do ZIP seja .wav
      const fileName = r.fileName.endsWith(".wav")
        ? r.fileName
        : `${r.fileName}.wav`;
      zip.file(fileName, r.buffer);
    });
    const zipBuffer = await zip.generateAsync({ type: "nodebuffer" });

    return reply
      .header("Content-Type", "application/zip")
      .header("Content-Disposition", `attachment; filename="${easycode}.zip"`)
      .send(zipBuffer);
  } catch (err: any) {
    console.error("Erro ao baixar gravação:", err);
    return reply.status(404).send({ error: err.message });
  }
}
