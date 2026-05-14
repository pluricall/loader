import {
  AdesaoPrincipal,
  AdesaoSecundaria,
  AllContacts,
} from "../../../domain/repositories/agilidade-repository";
import {
  NaoConvertidaPayload,
  SendContractsPayload,
} from "../../../http/schemas/agilidade-contracts.schema";

export class AgilidadeContractsPayloadBuilder {
  buildConvertida(
    ct: AllContacts,
    principal: AdesaoPrincipal,
    secundarios: AdesaoSecundaria[],
  ): SendContractsPayload {
    return {
      Id: ct.bd_id ?? "",
      PrimeiroNome: principal.nome ?? "",
      Apelido: "",
      Email: ct.enderecoemail ?? "",
      Telefone: String(ct.tel_marcado),
      Marca: this.mapMarca(principal.marca),
      DataNascimento: this.formatDateToApi(principal.data_nascimento),
      Status: "Convertida",
      RGPD: false,
      NomeColaborador: ct.logincontacto,
      DataAssinatura: this.formatDateToApi(ct.datacontacto),
      ValorAtivacao: Number(principal.preco),
      Mensalidade: Number(principal.preco),
      Pagamento: "Débito Direto",
      Periodicidade: this.mapPeriodicidade(ct.forma_pagamento),
      Banco: ct.banco ?? "",
      Bic: ct.balcao ?? "",
      Iban: `PT50${ct.banco}${ct.balcao}${ct.conta}${ct.checksum}`,
      NumeroConta: ct.conta ?? "",
      DataInicio: this.formatDebito(ct),
      ConcordaCobranca: ct.q1 === "Sim",
      ConhecimentoCondicoes: ct.q2 === "Sim",
      InformacoesVerdadeiras: ct.q3 === "Sim",
      Titular: {
        PrimeiroNome: principal.nome ?? "",
        Apelido: "",
        DataNascimento: this.formatDateToApi(principal.data_nascimento),
        NumeroDocumento: String(ct.doc_identificacao),
        NIF: Number(ct.nif),
        Sexo: this.mapSexo(principal.sexo),
        Telefone: String(ct.tel_marcado),
        Email: ct.enderecoemail ?? "",
        Rua: ct.morada,
        CodigoPostal: `${ct.cp1}-${ct.cp2}`,
        Cidade: ct.localidade,
        Concelho: ct.concelho,
      },
      Beneficiarios: secundarios.map((ad) => ({
        PrimeiroNome: ad.nome ?? "",
        Apelido: "",
        DataNascimento: this.formatDateToApi(ad.data_nascimento),
        Sexo: this.mapSexo(ad.sexo),
        Cidade: ad.localidade ?? undefined,
        Produto: ad.produto ?? "",
      })),
      Referencias: ct.obs
        ? [{ PrimeiroNome: ct.obs, Apelido: "", Telefone: "" }]
        : undefined,
    };
  }

  buildNaoConvertida(ct: any): NaoConvertidaPayload {
    let MotivoNaoInteresse: string | undefined;
    if (ct.resultado === "3") {
      MotivoNaoInteresse = ct.mot_nao_int;
    } else if (ct.resultado === "E") {
      MotivoNaoInteresse = "Nº Errado";
    } else if (ct.resultado === "M") {
      MotivoNaoInteresse = "Excesso de Tentativas";
    } else if (ct.resultado === "Y") {
      MotivoNaoInteresse = "Não quer ser mais contactado";
    } else if (ct.resultado === "Z") {
      MotivoNaoInteresse = "Não quer ser mais contactado";
    } else if (ct.resultado === "Q") {
      MotivoNaoInteresse = "Não tem interesse";
    } else if (ct.resultado === "C") {
      MotivoNaoInteresse = "Pensava que era Clinica";
    } else {
      MotivoNaoInteresse = "Não tem interesse";
    }

    return {
      Id: ct.bd_id ?? "",
      PrimeiroNome: ct.nome ?? "",
      Apelido: "",
      Email: ct.enderecoemail ?? "",
      Telefone: String(ct.tel_marcado),
      Marca: "",
      Status: this.mapStatus(ct.resultado) as NaoConvertidaPayload["Status"],
      MotivoNaoInteresse,
      RGPD: ct.resultado === "Z",
      NomeColaborador: ct.logincontacto,
    };
  }

  private mapStatus(resultado: string): SendContractsPayload["Status"] {
    const map: Record<string, SendContractsPayload["Status"]> = {
      "1": "Convertida",
      "3": "Sem Interesse",
      E: "Sem Interesse",
      M: "Sem Interesse",
      Y: "Sem Interesse",
      Q: "Sem Interesse",
      Z: "Sem Interesse",
      "2": "Agendada",
      I: "Agendada",
      C: "Sem Interesse",
      F: "Não Atendida",
      V: "Não Atendida",
    };
    return map[resultado] ?? "Não Atendida";
  }

  private mapSexo(sexo: string | null): "Feminino" | "Masculino" | undefined {
    if (sexo === "F") return "Feminino";
    if (sexo === "M") return "Masculino";
    return undefined;
  }

  private mapPeriodicidade(value: string | null): "Mensal" | "Anual" {
    if (value?.toUpperCase() === "ANUAL") return "Anual";
    return "Mensal";
  }

  private mapMarca(
    marca: string | null,
  ): "" | "Agilcare" | "Sorriso+" | "SorrisoPrime" {
    const allowed = ["Agilcare", "Sorriso+", "SorrisoPrime"];
    return allowed.includes(marca ?? "") ? (marca as any) : "";
  }

  private formatDateToApi(date: string | Date | null | undefined): string {
    if (!date) return "";
    const d = new Date(date);
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();
    return `${day}/${month}/${year}`;
  }

  private formatDebito(ct: any): string {
    if (!ct.dia_debito || !ct.mes_debito) return "";
    const year = new Date(ct.datacontacto).getFullYear();
    const month = String(ct.mes_debito).padStart(2, "0");
    const day = String(ct.dia_debito).padStart(2, "0");
    return `${day}/${month}/${year}`;
  }
}
