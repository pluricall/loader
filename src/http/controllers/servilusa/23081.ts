import { parseString } from "xml2js";
import { FastifyRequest, FastifyReply } from "fastify";
import { makeServilusa23081UseCase } from "../../../use-cases/servilusa/factories/make-23081-use-case";

export interface ServilusaEncuesta {
  id: string | number;
  nif_cliente: string;
  codigo_centro: string | number;
  codigo_campanya: string | number;
  codigo_oleada: string | number;
  codigo_interno_cliente: string;
  codigo_pregunta: string | number;
  nombre_centro: string;
  email: string;
  telefono: string;
  nombre_encuestado: string;
  idioma: string;
  fecha_crea: string;
  campo01: string;
  campo02: string;
  campo03: string;
  campo04: string;
  campo05: string;
  campo06: string;
  campo07: string;
  campo08: string;
  campo09: string;
  campo10: string;
  otrosdatos: string;
  observaciones?: string;
  skey: string;
}

export interface ServilusaRequest {
  encuesta: ServilusaEncuesta;
  request_ip: string;
  request_url: string;
  formdata: Record<string, any>;
}

interface XmlEncuesta {
  id: string;
  nif_cliente: string;
  codigo_centro: string;
  codigo_campanya: string;
  codigo_oleada: string;
  codigo_interno_cliente: string;
  codigo_pregunta: string;
  nombre_centro: string;
  email: string;
  telefono: string;
  nombre_encuestado: string;
  idioma: string;
  fecha_crea: string;
  campo01: string;
  campo02: string;
  campo03: string;
  campo04: string;
  campo05: string;
  campo06: string;
  campo07: string;
  campo08: string;
  campo09: string;
  campo10: string;
  otrosdatos: string;
  observaciones?: string;
  skey: string;
}

interface XmlCampanya {
  $: { id: string };
  encuesta: XmlEncuesta;
}

interface XmlListaEncuestas {
  lista_encuestas: {
    campanya: XmlCampanya;
  };
}

const parseXmlAsync = async (
  xml: string,
  options?: any,
): Promise<XmlListaEncuestas> => {
  return new Promise((resolve, reject) => {
    parseString(xml, options || {}, (err, result) => {
      if (err) reject(err);
      else resolve(result as XmlListaEncuestas);
    });
  });
};

export async function servilusa23081(
  request: FastifyRequest<{ Body: string }>,
  reply: FastifyReply,
) {
  try {
    const requestIp =
      request.headers["x-forwarded-for"]?.toString().split(",")[0]?.trim() ||
      request.headers["x-real-ip"]?.toString() ||
      request.ip ||
      "unknown";

    const xmlString = request.body;
    if (!xmlString || xmlString.trim() === "") {
      return reply
        .status(400)
        .header("Content-Type", "application/xml")
        .send(returnErrorXml("XML não fornecido", "EMPTY_XML"));
    }

    const servilusaUseCase = makeServilusa23081UseCase();

    let parsedXml: XmlListaEncuestas;
    try {
      parsedXml = await parseXmlAsync(xmlString, {
        explicitArray: false,
        trim: true,
        normalize: true,
        normalizeTags: false,
        explicitRoot: true,
      });
    } catch (parseError) {
      console.error("Erro ao parsear XML:", parseError);
      return reply
        .status(400)
        .header("Content-Type", "application/xml")
        .send(
          returnErrorXml(
            "Erro ao processar XML: formato inválido",
            "INVALID_XML",
          ),
        );
    }
    const listaEncuestas = parsedXml.lista_encuestas;
    if (
      !listaEncuestas ||
      !listaEncuestas.campanya ||
      !listaEncuestas.campanya.encuesta
    ) {
      return reply
        .status(400)
        .header("Content-Type", "application/xml")
        .send(
          returnErrorXml(
            "Estrutura XML inválida: tag encuesta não encontrada",
            "INVALID_STRUCTURE",
          ),
        );
    }

    const encuesta = listaEncuestas.campanya.encuesta;
    const encuestaData: ServilusaEncuesta = {
      id: encuesta.id || "",
      nif_cliente: encuesta.nif_cliente || "",
      codigo_centro: encuesta.codigo_centro || "",
      codigo_campanya: encuesta.codigo_campanya || "",
      codigo_oleada: encuesta.codigo_oleada || "",
      codigo_interno_cliente: encuesta.codigo_interno_cliente || "",
      codigo_pregunta: encuesta.codigo_pregunta || "",
      nombre_centro: encuesta.nombre_centro || "",
      email: encuesta.email || "",
      telefono: encuesta.telefono || "",
      nombre_encuestado: encuesta.nombre_encuestado || "",
      idioma: encuesta.idioma || "pt",
      fecha_crea: encuesta.fecha_crea || "",
      campo01: encuesta.campo01 || "",
      campo02: encuesta.campo02 || "",
      campo03: encuesta.campo03 || "",
      campo04: encuesta.campo04 || "",
      campo05: encuesta.campo05 || "",
      campo06: encuesta.campo06 || "",
      campo07: encuesta.campo07 || "",
      campo08: encuesta.campo08 || "",
      campo09: encuesta.campo09 || "",
      campo10: encuesta.campo10 || "",
      otrosdatos: encuesta.otrosdatos || "",
      observaciones: encuesta.observaciones || "",
      skey: encuesta.skey || "",
    };

    const result = await servilusaUseCase.execute({
      encuesta: encuestaData,
      request_ip: requestIp,
      request_url: request.url,
    });

    if (result.status === "OK") {
      servilusaUseCase
        .processAsync(encuestaData, result.gen_id)
        .catch((error) => {
          console.error("Erro no processAsync:", error);
        });
      return reply
        .status(200)
        .header("Content-Type", "application/xml")
        .send(returnSuccessXml(result.gen_id, encuestaData.id));
    } else {
      return reply
        .status(400)
        .header("Content-Type", "application/xml")
        .send(returnErrorXml(result.status_msg, "PROCESSING_ERROR"));
    }
  } catch (error) {
    return reply
      .status(500)
      .header("Content-Type", "application/xml")
      .send(returnErrorXml("Erro interno do servidor", "INTERNAL_ERROR"));
  }
}

function returnSuccessXml(genId: string, leadId: string | number): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>OK</status>
  <message>Encuesta recibida correctamente</message>
  <gen_id>${genId}</gen_id>
  <lead_id>${leadId}</lead_id>
  <timestamp>${new Date().toISOString()}</timestamp>
</response>`;
}

function returnErrorXml(message: string, code: string): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<response>
  <status>ERROR</status>
  <message>${message}</message>
  <code>${code}</code>
  <timestamp>${new Date().toISOString()}</timestamp>
</response>`;
}
