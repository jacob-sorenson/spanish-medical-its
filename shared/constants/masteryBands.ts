

export type MasteryBand = "weak" | "developing" | "strong";

export const MASTERY_BANDS = {
  weak: {
    min: 0,
    max: 0.39,
    label: "Weak",
    description: "Needs more review",
  },
  developing: {
    min: 0.4,
    max: 0.69,
    label: "Developing",
    description: "Making progress",
  },
  strong: {
    min: 0.7,
    max: 1,
    label: "Strong",
    description: "Relatively solid",
  },
} as const;

export function getMasteryBand(masteryProbability: number): MasteryBand {
  if (masteryProbability < 0.4) return "weak";
  if (masteryProbability < 0.7) return "developing";
  return "strong";
}