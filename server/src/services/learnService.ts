import { promises as fs } from "fs";
import path from "path";

import type { LearnerKCState } from "../../../shared/types/bkt";
import type { LearnNextRequest, LearnNextResponse } from "../../../shared/types/api";
import type { KnowledgeComponent } from "../../../shared/types/kc";

const DATA_DIR = path.resolve(process.cwd(), "src/data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const LEARNER_DIR = path.join(DATA_DIR, "learner");

const KNOWLEDGE_COMPONENTS_PATH = path.join(SEED_DIR, "knowledgeComponents.json");
const LEARNER_STATE_PATH = path.join(LEARNER_DIR, "learnerState.json");

interface LearnCandidate {
  kc: KnowledgeComponent;
  learnerState: LearnerKCState;
  lastViewedTimestamp: number;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, `${serialized}\n`, "utf8");
}

async function loadLearnerState(): Promise<LearnerKCState[]> {
  return readJsonFile<LearnerKCState[]>(LEARNER_STATE_PATH);
}

async function loadKnowledgeComponents(): Promise<KnowledgeComponent[]> {
  return readJsonFile<KnowledgeComponent[]>(KNOWLEDGE_COMPONENTS_PATH);
}

async function saveLearnerState(learnerState: LearnerKCState[]): Promise<void> {
  await writeJsonFile(LEARNER_STATE_PATH, learnerState);
}

function getLearnerStateByKCId(
  learnerStateList: LearnerKCState[],
  kcId: string
): { learnerState: LearnerKCState; index: number } {
  const index = learnerStateList.findIndex((item) => item.kcId === kcId);

  if (index === -1) {
    throw new Error(`Learner state not found for kcId: ${kcId}`);
  }

  return {
    learnerState: learnerStateList[index],
    index,
  };
}

function getLastViewedTimestamp(lastViewedAt: string | null): number {
  if (!lastViewedAt) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(lastViewedAt).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function compareReviewCandidates(a: LearnCandidate, b: LearnCandidate): number {
  if (a.learnerState.masteryProbability !== b.learnerState.masteryProbability) {
    return a.learnerState.masteryProbability - b.learnerState.masteryProbability;
  }

  if (a.learnerState.learnViewCount !== b.learnerState.learnViewCount) {
    return a.learnerState.learnViewCount - b.learnerState.learnViewCount;
  }

  if (a.lastViewedTimestamp !== b.lastViewedTimestamp) {
    return a.lastViewedTimestamp - b.lastViewedTimestamp;
  }

  return 0;
}

function selectRandomCandidate<T>(candidates: T[], topPoolSize = candidates.length): T {
  const selectionPool = candidates.slice(0, Math.min(candidates.length, topPoolSize));
  const selectedIndex = Math.floor(Math.random() * selectionPool.length);
  return selectionPool[selectedIndex];
}

export async function getNextLearnTerm(
  options: LearnNextRequest = {}
): Promise<LearnNextResponse> {
  const [kcs, learnerStateList] = await Promise.all([
    loadKnowledgeComponents(),
    loadLearnerState(),
  ]);

  const excludeKcIds = new Set(options.excludeKcIds ?? []);

  const candidates: LearnCandidate[] = kcs
    .filter((kc) => kc.active)
    .filter(
      (kc) =>
        (!options.preferredSystem || kc.system === options.preferredSystem) &&
        (!options.preferredTermType || kc.termType === options.preferredTermType) &&
        !excludeKcIds.has(kc.id)
    )
    .map((kc) => {
      const { learnerState } = getLearnerStateByKCId(learnerStateList, kc.id);

      return {
        kc,
        learnerState,
        lastViewedTimestamp: getLastViewedTimestamp(learnerState.lastViewedAt),
      };
    });

  if (candidates.length === 0) {
    throw new Error("No Learn candidates were found for the current filters.");
  }

  const unseenCandidates = candidates.filter((candidate) => !candidate.learnerState.hasViewedLearn);

  if (unseenCandidates.length > 0) {
    const selected = selectRandomCandidate(unseenCandidates);

    return {
      kc: selected.kc,
      learnerState: selected.learnerState,
      reason: "unseen_term",
    };
  }

  const rankedCandidates = [...candidates].sort(compareReviewCandidates);
  const selected = selectRandomCandidate(rankedCandidates, 5);

  return {
    kc: selected.kc,
    learnerState: selected.learnerState,
    reason: "guided_review",
  };
}

export async function markKCViewedInLearn(kcId: string): Promise<LearnerKCState> {
  const learnerStateList = await loadLearnerState();
  const { learnerState, index } = getLearnerStateByKCId(learnerStateList, kcId);
  const viewedAt = new Date().toISOString();

  const updatedLearnerState: LearnerKCState = {
    ...learnerState,
    hasViewedLearn: true,
    firstViewedAt: learnerState.firstViewedAt ?? viewedAt,
    lastViewedAt: viewedAt,
    learnViewCount: learnerState.learnViewCount + 1,
  };

  learnerStateList[index] = updatedLearnerState;

  await saveLearnerState(learnerStateList);

  return updatedLearnerState;
}
