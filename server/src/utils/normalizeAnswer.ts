export function normalizeAnswer(input: string): string {
  return input
    .trim()
    .toLowerCase()
    .normalize("NFD") // split accented chars into base + accent mark
    .replace(/[\u0300-\u036f]/g, "") // remove accent marks
    .replace(/[’']/g, "'") // normalize apostrophes
    .replace(/\s+/g, " "); // collapse repeated whitespace
}