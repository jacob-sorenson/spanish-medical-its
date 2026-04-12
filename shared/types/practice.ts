export type PracticeItemType =
  | "typed_en_to_es"
  | "mcq_en_to_es"
  | "mcq_es_to_en"
  | "official_vs_alternate";

export interface PracticeItem {
  id: string;
  kcId: string;
  itemType: PracticeItemType;
  prompt: string;
  correctAnswer: string;
  acceptableAnswers: string[];
  choices?: string[];
  explanation?: string;
  active: boolean;
}