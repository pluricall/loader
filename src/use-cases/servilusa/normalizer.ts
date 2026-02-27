export function generateNormalizedPhonePT(phone: string): string {
  if (!phone) return "";

  // remove tudo que não for número
  let digits = phone.replace(/\D/g, "");

  // remove prefixo internacional 00351
  if (digits.startsWith("00351")) {
    digits = digits.substring(5);
  }

  // remove prefixo 351
  if (digits.startsWith("351")) {
    digits = digits.substring(3);
  }

  // remove zero inicial extra (caso exista)
  if (digits.startsWith("0") && digits.length > 9) {
    digits = digits.substring(1);
  }

  // validação básica PT móvel
  if (digits.length !== 9) {
    return "";
  }

  if (!digits.startsWith("9")) {
    return "";
  }

  return digits;
}
