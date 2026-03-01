export function generateNormalizedPhonePT(phone: any): string {
  try {
    if (typeof phone !== "string" || phone.trim() === "") {
      return "";
    }

    let digits = phone.replace(/\D/g, "");

    if (!digits) return "";

    while (digits.startsWith("00")) {
      digits = digits.substring(2);
    }

    if (digits.startsWith("351")) {
      digits = digits.substring(3);
    }

    if (digits.startsWith("0") && digits.length > 9) {
      digits = digits.substring(1);
    }

    if (digits.length !== 9) return "";
    if (!digits.startsWith("9")) return "";

    return digits;
  } catch {
    return "";
  }
}
