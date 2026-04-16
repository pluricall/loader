export type Marca = "Agilcare" | "Sorriso+" | "SorrisoPrime";

export type ContractStatus =
  | "Agendada"
  | "Não Atendida"
  | "Sem Interesse"
  | "Exausta"
  | "Convertida";

export type MotivoNaoInteresse =
  | "Preço elevado"
  | "Já tem plano"
  | "Sem interesse no momento"
  | "Outros"; // ajuste conforme a opção 1 da documentação do cliente

export type Pagamento = "Débito Direto" | "Transferência";
export type Periodicidade = "Mensal" | "Anual";
export type Sexo = "Feminino" | "Masculino";

// Ajuste com os valores reais da opção 2 da documentação do cliente
export type ProdutoBeneficiario = string;

export interface TitularPayload {
  PrimeiroNome: string;
  Apelido: string;
  /** Formato: DD/MM/YYYY */
  DataNascimento: string;
  NumeroDocumento: string;
  NIF: number;
  Sexo?: Sexo;
  Telefone: string;
  Email: string;
  Rua: string;
  /** Formato: xxxx-xxx */
  CodigoPostal: string;
  Cidade: string;
  Concelho: string;
}

export interface BeneficiarioPayload {
  PrimeiroNome: string;
  Apelido: string;
  /** Formato: DD/MM/YYYY */
  DataNascimento?: string;
  Sexo?: Sexo;
  Cidade?: string;
  Produto: ProdutoBeneficiario;
  Clinica?: string;
}

export interface ReferenciaPayload {
  PrimeiroNome: string;
  Apelido: string;
  Telefone: string;
}

// ─── Payload principal ───────────────────────────────────────────────────────

export interface SendContractsPayload {
  /** Valor retornado no envio da Lead */
  Id: string;
  PrimeiroNome: string;
  Apelido: string;
  Email: string;
  Telefone: string;
  Marca: Marca;
  /** Formato: DD/MM/YYYY */
  DataNascimento?: string;
  Status: ContractStatus;
  /** Obrigatório quando Status = "Sem Interesse" */
  MotivoNaoInteresse?: MotivoNaoInteresse;
  RGPD: boolean;
  NomeColaborador: string;
  /** Formato: DD/MM/YYYY */
  DataAssinatura: string;
  /** Pode ter 2 casas decimais */
  ValorAtivacao: number;
  /** Pode ter 2 casas decimais */
  Mensalidade: number;
  Pagamento: Pagamento;
  Periodicidade: Periodicidade;
  Banco?: string;
  Bic?: string;
  Iban?: string;
  NumeroConta?: string;
  /** Formato: DD/MM/YYYY */
  DataInicio: string;
  ConcordaCobranca: boolean;
  ConhecimentoCondicoes: boolean;
  InformacoesVerdadeiras: boolean;
  Titular: TitularPayload;
  /** Pelo menos 1 beneficiário obrigatório */
  Beneficiarios: [BeneficiarioPayload, ...BeneficiarioPayload[]];
  Referencias?: ReferenciaPayload[];
}
