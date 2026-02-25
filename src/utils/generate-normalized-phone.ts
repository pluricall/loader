export function generateNormalizedPhone(phone?: string): string {
  if (!phone) return "";
  let normalizedPhone = phone.replace(/\D/g, "");
  if (normalizedPhone.startsWith("351"))
    normalizedPhone = normalizedPhone.slice(3);
  return normalizedPhone;
}
