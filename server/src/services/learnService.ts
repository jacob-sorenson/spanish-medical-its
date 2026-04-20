import { promises as fs } from "fs";
import path from "path";

import type { LearnerKCState } from "../../../shared/types/bkt";

const DATA_DIR = path.resolve(process.cwd(), "src/data");
const LEARNER_DIR = path.join(DATA_DIR, "learner");

const LEARNER_STATE_PATH = path.join(LEARNER_DIR, "learnerState.json");

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
