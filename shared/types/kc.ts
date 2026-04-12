export type MedicalSystem =
  | "cardiovascular"
  | "digestive"
  | "endocrine"
  | "musculoskeletal"
  | "nervous"
  | "respiratory"
  | "skin"
  | "urinary"
  | "female_reproduction"
  | "male_reproduction"
  | "miscellaneous";

export type TermType =
  | "anatomy"
  | "symptom"
  | "condition"
  | "procedure"
  | "test"
  | "specialist"
  | "treatment"
  | "general_phrase"
  | "other";

export interface KnowledgeComponent {
  id: string;
  slug: string;
  system: MedicalSystem;
  termType: TermType;

  englishTerm: string;
  officialSpanish: string;
  backupTerms: string[];
  otherTerms: string[];

  difficulty: number;
  sourcePage: number;
  active: boolean;
}
