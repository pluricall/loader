import { EndesaLeadDTO } from "../dtos/endesa-lead.dto";
import { EndesaLeadProps } from "./lead-types";

export class EndesaLead {
  readonly genId: string;
  readonly phoneNumber: string;
  readonly leadId: string;
  readonly telefone: string;
  readonly nome: string;
  readonly apelido: string;
  readonly genero: string;
  readonly dataNascimento: string;
  readonly cp4: number;
  readonly cp3: number;

  private constructor(props: EndesaLeadProps) {
    this.genId = props.genId;
    this.phoneNumber = props.phoneNumber;
    this.leadId = props.leadId;
    this.telefone = props.telefone;
    this.nome = props.nome;
    this.apelido = props.apelido;
    this.genero = props.genero;
    this.dataNascimento = props.dataNascimento;
    this.cp4 = props.cp4;
    this.cp3 = props.cp3;
  }

  static create(
    dto: EndesaLeadDTO,
    genId: string,
    phoneNumber: string,
  ): EndesaLead {
    return new EndesaLead({
      genId,
      phoneNumber,
      leadId: dto.lead_id ?? "",
      telefone: dto.telefone,
      nome: dto.nome.trim(),
      apelido: dto.apelido?.trim() ?? "",
      genero: dto.genero ?? "",
      dataNascimento: dto.data_nascimento ?? "",
      cp4: dto.cp4 ?? 0,
      cp3: dto.cp3 ?? 0,
    });
  }
}
