export function sanitizeForSharePoint(name: string) {
  return name
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[<>:"/\\|?*%&'+]/g, "_")
    .replace(/\s+/g, "_")
    .replace(/[.]$/, "")
    .trim();
}
