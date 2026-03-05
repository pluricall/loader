import { EndesaLead } from "../../domain/entities/lead";

export class EndesaMapper {
  private static truncate(
    value: string | undefined | null,
    maxLength: number,
  ): string {
    if (!value) return "";
    return String(value).substring(0, maxLength);
  }

  static toPersistence(
    lead: EndesaLead,
    requestIp: string,
    requestUrl: string,
  ) {
    return {
      timestamp: new Date().toISOString().replace("T", " ").replace("Z", ""),
      request_ip: this.truncate(requestIp, 50),
      request_url: this.truncate(requestUrl, 300),
      gen_id: this.truncate(lead.genId, 70),
      campanha_easy: this.truncate("Endesa_out_leads", 30),
      contact_list_easy: this.truncate("UNDEFINED", 50),
      plc_cod_bd_easy: this.truncate("Leads", 30),
      mapping_template: this.truncate("DEFAULT", 150),
      raw_phone_number: this.truncate(lead.telefone, 50),
      phone_number: this.truncate(lead.phoneNumber, 14),
      lead_status: this.truncate("RECEIVED", 100),
      lead_id: this.truncate(lead.leadId, 70),
      nome: this.truncate(lead.nome, 80),
      apelido: this.truncate(lead.apelido, 80),
      genero: this.truncate(lead.genero, 15),
      data_nascimento: this.truncate(lead.dataNascimento, 50),
      cp4: this.truncate(String(lead.cp4), 4),
      cp3: this.truncate(String(lead.cp3), 3),
      comercializadora: this.truncate("", 80),
      titular_fatura: this.truncate("", 80),
      source: this.truncate("", 50),
      data_integracao: new Date()
        .toISOString()
        .replace("T", " ")
        .replace("Z", ""),
      formdata: JSON.stringify(lead),
    };
  }
}
