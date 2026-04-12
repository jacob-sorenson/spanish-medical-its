export function formatMastery(value: number | string) {
  if (typeof value === "string") {
    return value;
  }

  return `${Math.round(value * 100)}%`;
}
