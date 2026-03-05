import { FastifyRequest } from "fastify";
import { extractAllFields } from "../../utils/extract-fields";

export async function parseAgildadeBody(
  request: FastifyRequest,
): Promise<void> {
  try {
    let parsedBody: Record<string, any> = {};

    if (request.body && typeof request.body === "object") {
      const bodyObj = request.body as Record<string, any>;
      const keys = Object.keys(bodyObj);

      if (keys.length === 1) {
        const jsonString = keys[0];
        const innerJsonMatch = jsonString.match(/^\{.*?\}(?=:"")/);

        if (innerJsonMatch) {
          try {
            const cleanJson = innerJsonMatch[0]
              .replace(/\\"/g, '"')
              .replace(/\\n/g, "")
              .replace(/\\r/g, "")
              .replace(/\\t/g, "")
              .replace(/\s+/g, " ")
              .trim();

            parsedBody = JSON.parse(cleanJson);
          } catch {
            parsedBody = extractAllFields(jsonString);
          }
        } else {
          parsedBody = extractAllFields(jsonString);
        }
      }
    }

    Object.keys(parsedBody).forEach((key) => {
      if (typeof parsedBody[key] === "string") {
        parsedBody[key] = parsedBody[key].trim();
      }
    });

    if (parsedBody.telefone) {
      parsedBody.telefone = parsedBody.telefone.replace(/^\s+/, "");
    }

    request.parsedBody = parsedBody;
  } catch (error) {
    console.error("Erro no parseAgildadeBody middleware:", error);
    request.parsedBody = {};
  }
}
