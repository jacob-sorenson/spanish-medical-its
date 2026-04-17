import { promises as fs } from "fs";
import path from "path";

import { getMasteryBand } from "../../../shared/constants/masteryBands";
import type { LearnerKCState } from "../../../shared/types/bkt";
import type {
  DashboardCategorySummary,
  DashboardKCRow,
  DashboardResponse,
} from "../../../shared/types/dashboard";
import type { KnowledgeComponent } from "../../../shared/types/kc";

const DATA_DIR = path.resolve(process.cwd(), "src/data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const LEARNER_DIR = path.join(DATA_DIR, "learner");

const KNOWLEDGE_COMPONENTS_PATH = path.join(SEED_DIR, "knowledgeComponents.json");
const LEARNER_STATE_PATH = path.join(LEARNER_DIR, "learnerState.json");

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function loadKnowledgeComponents(): Promise<KnowledgeComponent[]> {
  return readJsonFile<KnowledgeComponent[]>(KNOWLEDGE_COMPONENTS_PATH);
}

async function loadLearnerState(): Promise<LearnerKCState[]> {
  return readJsonFile<LearnerKCState[]>(LEARNER_STATE_PATH);
}

function getLearnerStateByKCId(
  learnerStateList: LearnerKCState[],
  kcId: string
): LearnerKCState {
  const learnerState = learnerStateList.find((item) => item.kcId === kcId);

  if (!learnerState) {
    throw new Error(`Learner state not found for kcId: ${kcId}`);
  }

  return learnerState;
}

export async function getDashboardData(): Promise<DashboardResponse> {
  const [kcs, learnerStateList] = await Promise.all([
    loadKnowledgeComponents(),
    loadLearnerState(),
  ]);

  const activeKcs = kcs.filter((kc) => kc.active);

  const kcRows: DashboardKCRow[] = activeKcs
    .map((kc) => {
      const learnerState = getLearnerStateByKCId(learnerStateList, kc.id);

      return {
        kcId: kc.id,
        englishTerm: kc.englishTerm,
        officialSpanish: kc.officialSpanish,
        system: kc.system,
        masteryProbability: learnerState.masteryProbability,
        opportunities: learnerState.opportunities,
        lastPracticeAt: learnerState.lastPracticeAt,
        band: getMasteryBand(learnerState.masteryProbability),
      };
    })
    .sort((a, b) => {
      if (a.system !== b.system) {
        return a.system.localeCompare(b.system);
      }

      return a.englishTerm.localeCompare(b.englishTerm);
    });

  const practicedKCs = kcRows.filter((row) => row.opportunities > 0);

  const summary: DashboardResponse["summary"] = {
    totalKCs: kcRows.length,
    practicedKCs: practicedKCs.length,
    weakCount: kcRows.filter((row) => row.band === "weak").length,
    developingCount: kcRows.filter((row) => row.band === "developing").length,
    strongCount: kcRows.filter((row) => row.band === "strong").length,
  };

  const categoriesMap = new Map<KnowledgeComponent["system"], DashboardCategorySummary>();

  for (const row of kcRows) {
    const existing = categoriesMap.get(row.system);

    if (!existing) {
      categoriesMap.set(row.system, {
        system: row.system,
        averageMastery: row.masteryProbability,
        totalTerms: 1,
        practicedTerms: row.opportunities > 0 ? 1 : 0,
      });
      continue;
    }

    const nextTotalTerms = existing.totalTerms + 1;
    categoriesMap.set(row.system, {
      system: row.system,
      averageMastery:
        (existing.averageMastery * existing.totalTerms + row.masteryProbability) / nextTotalTerms,
      totalTerms: nextTotalTerms,
      practicedTerms: existing.practicedTerms + (row.opportunities > 0 ? 1 : 0),
    });
  }

  const categories = [...categoriesMap.values()].sort((a, b) => a.system.localeCompare(b.system));

  return {
    summary,
    categories,
    kcRows,
  };
}
