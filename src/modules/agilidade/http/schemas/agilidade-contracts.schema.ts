import { z } from "zod";

const TitularSchema = z.object({
  PrimeiroNome: z.string(),
  Apelido: z.string(),
  DataNascimento: z.string(), // DD/MM/YYYY
  NumeroDocumento: z.string(),
  NIF: z.number(),
  Sexo: z.enum(["Feminino", "Masculino"]).optional(),
  Telefone: z.string(),
  Email: z.string().email(),
  Rua: z.string(),
  CodigoPostal: z.string().regex(/^\d{4}-\d{3}$/, "Formato inválido: xxxx-xxx"),
  Cidade: z.string(),
  Concelho: z.string(),
});

const BeneficiarioSchema = z.object({
  PrimeiroNome: z.string(),
  Apelido: z.string(),
  DataNascimento: z.string().optional(), // DD/MM/YYYY
  Sexo: z.enum(["Feminino", "Masculino"]).optional(),
  Cidade: z.string().optional(),
  Produto: z.string(),
  Clinica: z.string().optional(),
});

const ReferenciaSchema = z.object({
  PrimeiroNome: z.string(),
  Apelido: z.string(),
  Telefone: z.string(),
});

export const sendContractsSchema = z.object({
  Id: z.string(),
  PrimeiroNome: z.string(),
  Apelido: z.string(),
  Email: z.string().email(),
  Telefone: z.string(),
  Marca: z.enum(["Agilcare", "Sorriso+", "SorrisoPrime"]),
  DataNascimento: z.string().optional(),
  Status: z.enum([
    "Agendada",
    "Não Atendida",
    "Sem Interesse",
    "Exausta",
    "Convertida",
  ]),
  MotivoNaoInteresse: z
    .enum([
      "Preço elevado",
      "Já tem plano",
      "Sem interesse no momento",
      "Outros",
    ])
    .optional(),
  RGPD: z.boolean(),
  NomeColaborador: z.string(),
  DataAssinatura: z.string(), // DD/MM/YYYY
  ValorAtivacao: z.number().multipleOf(0.01),
  Mensalidade: z.number().multipleOf(0.01),
  Pagamento: z.enum(["Débito Direto", "Transferência"]),
  Periodicidade: z.enum(["Mensal", "Anual"]),
  Banco: z.string().optional(),
  Bic: z.string().optional(),
  Iban: z.string().optional(),
  NumeroConta: z.string().optional(),
  DataInicio: z.string(), // DD/MM/YYYY
  ConcordaCobranca: z.boolean(),
  ConhecimentoCondicoes: z.boolean(),
  InformacoesVerdadeiras: z.boolean(),
  Titular: TitularSchema,
  Beneficiarios: z.array(BeneficiarioSchema).min(1),
  Referencias: z.array(ReferenciaSchema).optional(),
});

export type SendContractsPayload = z.infer<typeof sendContractsSchema>;
