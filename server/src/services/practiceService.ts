

import { promises as fs } from "fs";
import path from "path";

import type { AttemptRecord, BKTParameters, LearnerKCState } from "../../../shared/types/bkt";
import type { KnowledgeComponent } from "../../../shared/types/kc";
import type { PracticeItem } from "../../../shared/types/practice";
import { applyPracticeResultToLearnerState } from "./bktService";
import { scoreResponse } from "./scoringService";

const DATA_DIR = path.resolve(__dirname, "../data");
const SEED_DIR = path.join(DATA_DIR, "seed");
const LEARNER_DIR = path.join(DATA_DIR, "learner");

const KNOWLEDGE_COMPONENTS_PATH = path.join(SEED_DIR, "knowledgeComponents.json");
const BKT_PARAMETERS_PATH = path.join(SEED_DIR, "bktParameters.json");
const PRACTICE_ITEMS_PATH = path.join(SEED_DIR, "practiceItems.json");
const LEARNER_STATE_PATH = path.join(LEARNER_DIR, "learnerState.json");
const ATTEMPT_HISTORY_PATH = path.join(LEARNER_DIR, "attemptHistory.json");

export interface SubmitPracticeAnswerInput {
  kcId: string;
  practiceItemId: string;
  userAnswer: string;
}

export interface SubmitPracticeAnswerResult {
  kc: KnowledgeComponent;
  practiceItem: PracticeItem;
  params: BKTParameters;
  learnerStateBefore: LearnerKCState;
  learnerStateAfter: LearnerKCState;
  scoring: ReturnType<typeof scoreResponse>;
  attemptRecord: AttemptRecord;
}

export interface GetNextPracticeItemResult {
  kc: KnowledgeComponent;
  practiceItem: PracticeItem;
  learnerState: LearnerKCState;
  params: BKTParameters;
  reason: "new_term" | "low_mastery";
}

interface PracticeCandidate {
  kc: KnowledgeComponent;
  learnerState: LearnerKCState;
  params: BKTParameters;
  practiceItems: PracticeItem[];
}

interface RankedPracticeCandidate extends PracticeCandidate {
  learnViewedButUnpracticed: boolean;
  lastPracticeTimestamp: number;
}

async function readJsonFile<T>(filePath: string): Promise<T> {
  const raw = await fs.readFile(filePath, "utf-8");
  return JSON.parse(raw) as T;
}

async function writeJsonFile<T>(filePath: string, data: T): Promise<void> {
  const serialized = JSON.stringify(data, null, 2);
  await fs.writeFile(filePath, `${serialized}\n`, "utf-8");
}

export async function loadKnowledgeComponents(): Promise<KnowledgeComponent[]> {
  return readJsonFile<KnowledgeComponent[]>(KNOWLEDGE_COMPONENTS_PATH);
}

export async function loadBKTParameters(): Promise<BKTParameters[]> {
  return readJsonFile<BKTParameters[]>(BKT_PARAMETERS_PATH);
}

export async function loadPracticeItems(): Promise<PracticeItem[]> {
  return readJsonFile<PracticeItem[]>(PRACTICE_ITEMS_PATH);
}

export async function loadLearnerState(): Promise<LearnerKCState[]> {
  return readJsonFile<LearnerKCState[]>(LEARNER_STATE_PATH);
}

export async function loadAttemptHistory(): Promise<AttemptRecord[]> {
  return readJsonFile<AttemptRecord[]>(ATTEMPT_HISTORY_PATH);
}

export async function saveLearnerState(learnerState: LearnerKCState[]): Promise<void> {
  await writeJsonFile(LEARNER_STATE_PATH, learnerState);
}

export async function saveAttemptHistory(attemptHistory: AttemptRecord[]): Promise<void> {
  await writeJsonFile(ATTEMPT_HISTORY_PATH, attemptHistory);
}

function getKnowledgeComponentById(kcs: KnowledgeComponent[], kcId: string): KnowledgeComponent {
  const kc = kcs.find((item) => item.id === kcId);

  if (!kc) {
    throw new Error(`Knowledge component not found for kcId: ${kcId}`);
  }

  return kc;
}

function getPracticeItemById(practiceItems: PracticeItem[], practiceItemId: string): PracticeItem {
  const practiceItem = practiceItems.find((item) => item.id === practiceItemId);

  if (!practiceItem) {
    throw new Error(`Practice item not found for practiceItemId: ${practiceItemId}`);
  }

  return practiceItem;
}

function getBKTParametersByKCId(paramsList: BKTParameters[], kcId: string): BKTParameters {
  const params = paramsList.find((item) => item.kcId === kcId);

  if (!params) {
    throw new Error(`BKT parameters not found for kcId: ${kcId}`);
  }

  return params;
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

function getActivePracticeItemsByKCId(
  practiceItems: PracticeItem[],
  kcId: string
): PracticeItem[] {
  return practiceItems.filter((item) => item.kcId === kcId && item.active);
}

function getLastPracticeTimestamp(lastPracticeAt: string | null): number {
  if (!lastPracticeAt) {
    return Number.NEGATIVE_INFINITY;
  }

  const timestamp = new Date(lastPracticeAt).getTime();
  return Number.isNaN(timestamp) ? Number.NEGATIVE_INFINITY : timestamp;
}

function rankPracticeCandidate(candidate: PracticeCandidate): RankedPracticeCandidate {
  return {
    ...candidate,
    learnViewedButUnpracticed:
      candidate.learnerState.hasViewedLearn && candidate.learnerState.opportunities === 0,
    lastPracticeTimestamp: getLastPracticeTimestamp(candidate.learnerState.lastPracticeAt),
  };
}

function compareRankedPracticeCandidates(
  a: RankedPracticeCandidate,
  b: RankedPracticeCandidate
): number {
  if (a.learnViewedButUnpracticed && !b.learnViewedButUnpracticed) return -1;
  if (!a.learnViewedButUnpracticed && b.learnViewedButUnpracticed) return 1;

  if (a.learnerState.masteryProbability !== b.learnerState.masteryProbability) {
    return a.learnerState.masteryProbability - b.learnerState.masteryProbability;
  }

  if (a.lastPracticeTimestamp !== b.lastPracticeTimestamp) {
    return a.lastPracticeTimestamp - b.lastPracticeTimestamp;
  }

  if (a.learnerState.opportunities !== b.learnerState.opportunities) {
    return a.learnerState.opportunities - b.learnerState.opportunities;
  }

  return 0;
}

function selectRandomCandidate(
  rankedCandidates: RankedPracticeCandidate[],
  lastAttemptedKcId: string | null
): RankedPracticeCandidate {
  const topPoolSize = Math.min(rankedCandidates.length, 5);
  const topCandidates = rankedCandidates.slice(0, topPoolSize);
  const nonRepeatedCandidates = topCandidates.filter(
    (candidate) => candidate.kc.id !== lastAttemptedKcId
  );
  const selectionPool =
    nonRepeatedCandidates.length > 0 ? nonRepeatedCandidates : topCandidates;
  const selectedIndex = Math.floor(Math.random() * selectionPool.length);

  return selectionPool[selectedIndex];
}


export async function getNextPracticeItem(): Promise<GetNextPracticeItemResult> {
  const [kcs, paramsList, practiceItems, learnerStateList, attemptHistory] = await Promise.all([
    loadKnowledgeComponents(),
    loadBKTParameters(),
    loadPracticeItems(),
    loadLearnerState(),
    loadAttemptHistory(),
  ]);

  const candidates: PracticeCandidate[] = kcs
    .filter((kc) => kc.active)
    .map((kc) => {
      const { learnerState } = getLearnerStateByKCId(learnerStateList, kc.id);
      const params = getBKTParametersByKCId(paramsList, kc.id);
      const activePracticeItems = getActivePracticeItemsByKCId(practiceItems, kc.id);

      return {
        kc,
        learnerState,
        params,
        practiceItems: activePracticeItems,
      };
    })
    .filter((candidate) => candidate.practiceItems.length > 0);

  if (candidates.length === 0) {
    throw new Error("No active practice candidates were found.");
  }

  const rankedCandidates = candidates
    .map(rankPracticeCandidate)
    .sort(compareRankedPracticeCandidates);
  const lastAttemptedKcId =
    attemptHistory.length > 0 ? attemptHistory[attemptHistory.length - 1].kcId : null;

  const selected = selectRandomCandidate(rankedCandidates, lastAttemptedKcId);
  const selectedPracticeItem = selected.practiceItems[0];
  const reason = selected.learnViewedButUnpracticed ? "new_term" : "low_mastery";

  return {
    kc: selected.kc,
    practiceItem: selectedPracticeItem,
    learnerState: selected.learnerState,
    params: selected.params,
    reason,
  };
}

function buildAttemptRecord(args: {
  kcId: string;
  practiceItemId: string;
  userAnswer: string;
  normalizedAnswer: string;
  outcome: AttemptRecord["outcome"];
  countedAsCorrectForBKT: boolean;
  masteryBefore: number;
  masteryAfter: number;
  submittedAt: string;
}): AttemptRecord {
  return {
    id: `attempt_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    kcId: args.kcId,
    practiceItemId: args.practiceItemId,
    userAnswer: args.userAnswer,
    normalizedAnswer: args.normalizedAnswer,
    outcome: args.outcome,
    countedAsCorrectForBKT: args.countedAsCorrectForBKT,
    masteryBefore: args.masteryBefore,
    masteryAfter: args.masteryAfter,
    submittedAt: args.submittedAt,
  };
}

export async function submitPracticeAnswer(
  input: SubmitPracticeAnswerInput
): Promise<SubmitPracticeAnswerResult> {
  const [kcs, paramsList, practiceItems, learnerStateList, attemptHistory] = await Promise.all([
    loadKnowledgeComponents(),
    loadBKTParameters(),
    loadPracticeItems(),
    loadLearnerState(),
    loadAttemptHistory(),
  ]);

  const kc = getKnowledgeComponentById(kcs, input.kcId);
  const practiceItem = getPracticeItemById(practiceItems, input.practiceItemId);

  if (practiceItem.kcId !== input.kcId) {
    throw new Error(
      `Practice item ${input.practiceItemId} does not belong to knowledge component ${input.kcId}`
    );
  }

  const params = getBKTParametersByKCId(paramsList, input.kcId);
  const { learnerState: learnerStateBefore, index } = getLearnerStateByKCId(
    learnerStateList,
    input.kcId
  );

  const scoring = scoreResponse(practiceItem, input.userAnswer);
  const practicedAt = new Date().toISOString();

  const { learnerState: learnerStateAfter } = applyPracticeResultToLearnerState(
    learnerStateBefore,
    params,
    scoring.countedAsCorrectForBKT,
    practicedAt
  );

  learnerStateList[index] = learnerStateAfter;

  const attemptRecord = buildAttemptRecord({
    kcId: input.kcId,
    practiceItemId: input.practiceItemId,
    userAnswer: input.userAnswer,
    normalizedAnswer: scoring.normalizedUserAnswer,
    outcome: scoring.outcome,
    countedAsCorrectForBKT: scoring.countedAsCorrectForBKT,
    masteryBefore: learnerStateBefore.masteryProbability,
    masteryAfter: learnerStateAfter.masteryProbability,
    submittedAt: practicedAt,
  });

  attemptHistory.push(attemptRecord);

  await Promise.all([
    saveLearnerState(learnerStateList),
    saveAttemptHistory(attemptHistory),
  ]);

  return {
    kc,
    practiceItem,
    params,
    learnerStateBefore,
    learnerStateAfter,
    scoring,
    attemptRecord,
  };
}
