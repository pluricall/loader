import { ServilusaRepository } from "../../repositories/servilusa-repository";
import { generateDataload } from "../../utils/generate-dataload";
import { generateGenId } from "../../utils/generate-gen-id";
import { generatePlcId } from "../../utils/generate-plc-id";
import { AltitudeCreateContact } from "../altitude/create-contact";
import { generateNormalizedPhonePT } from "./normalizer";

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

export interface Servilusa23081Request {
  encuesta: ServilusaEncuesta;
  request_ip: string;
  request_url: string;
}

export class Servilusa23081UseCase {
  constructor(
    private servilusaRepository: ServilusaRepository,
    private altitudeCreateContact: AltitudeCreateContact,
  ) {}

  private CAMPAIGN = "servilusa_out";
  private CONTACT_LIST = "Autoload";
  private PLC_COD_BD = "UNDEFINED";
  private MAPPING_TEMPLATE = "DEFAULT";
  private LEAD_STATUS = "PENDING";

  async execute(request: Servilusa23081Request) {
    try {
      const gen_id = generateGenId();
      const encuesta = request.encuesta;

      const rawPhoneNumber = String(encuesta.telefono || "");
      const normalizedPhone = generateNormalizedPhonePT(rawPhoneNumber);

      await this.servilusaRepository.insertAtServilusaLeadsRepository({
        lead_id: encuesta.id,
        encuesta_id: encuesta.id,
        gen_id,
        timestamp: new Date(),
        request_ip: request.request_ip,
        request_url: request.request_url,

        campanha_easy: this.CAMPAIGN,
        contact_list_easy: this.CONTACT_LIST,
        plc_cod_bd_easy: this.PLC_COD_BD,
        mapping_template: this.MAPPING_TEMPLATE,

        raw_phone_number: rawPhoneNumber,
        phone_number: normalizedPhone,
        email: encuesta.email || "",
        telefono: normalizedPhone,

        lead_status: this.LEAD_STATUS,

        nif_cliente: encuesta.nif_cliente || "",
        codigo_centro: encuesta.codigo_centro,
        codigo_campanya: encuesta.codigo_campanya,
        codigo_oleada: encuesta.codigo_oleada,
        codigo_interno_cliente: encuesta.codigo_interno_cliente || "",
        codigo_pregunta: encuesta.codigo_pregunta,
        nombre_centro: encuesta.nombre_centro || "",
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

        formdata: encuesta,
      });

      return {
        status: "OK",
        gen_id,
      };
    } catch (error: any) {
      console.error("❌ Erro ao salvar lead:", error);
      return {
        status: "error",
        status_msg: error.message || "Erro interno ao processar",
        gen_id: "",
      };
    }
  }

  async processAsync(request: ServilusaEncuesta, gen_id: string) {
    try {
      const dataload = generateDataload();
      const plc_id = generatePlcId();
      const normalizedPhoneNumber = generateNormalizedPhonePT(request.telefono);

      const payload = {
        campaignName: this.CAMPAIGN,
        contactCreateRequest: {
          Status: "Started",
          ContactListName: {
            RequestType: "Set",
            Value: this.CONTACT_LIST,
          },
          Attributes: [
            {
              discriminator: "DatabaseFields",
              Name: "HomePhone",
              Value: normalizedPhoneNumber,
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "FirstName",
              Value: request.nombre_encuestado || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "observacoes",
              Value: request.otrosdatos || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "plc_cod_bd",
              Value: String(request.id),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "lead_id",
              Value: String(request.id),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "gen_id",
              Value: gen_id,
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "encuesta_id",
              Value: String(request.id),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "nif",
              Value: request.nif_cliente || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "codigo_centro",
              Value: String(request.codigo_centro || ""),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "codigo_campanya",
              Value: String(request.codigo_campanya || ""),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "codigo_oleada",
              Value: String(request.codigo_oleada || ""),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "codigo_interno_cliente",
              Value: request.codigo_interno_cliente || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "codigo_pregunta",
              Value: String(request.codigo_pregunta || ""),
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "nombre_centro",
              Value: request.nombre_centro || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "idioma",
              Value: request.idioma || "pt",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "skey",
              Value: request.skey || "",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "bd",
              Value: "LEADS",
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "dataload",
              Value: dataload,
              IsAnonymized: false,
            },
            {
              discriminator: "DatabaseFields",
              Name: "plc_id",
              Value: plc_id,
              IsAnonymized: false,
            },
          ],
        },
      };

      await this.altitudeCreateContact.execute({
        environment: "onprem",
        payload,
      });

      await this.servilusaRepository.updateLeadStatus(gen_id, "LOADED");
    } catch (err) {
      console.error("Erro em processAsync para gen_id", gen_id, ":", err);
      await this.servilusaRepository.updateLeadStatus(gen_id, "ERROR");
    }
  }
}
