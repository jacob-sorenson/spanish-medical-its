import { promises as fs } from "fs";
import path from "path";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it } from "vitest";

import app from "../app";

type LearnerState = {
  kcId: string;
  masteryProbability: number;
  opportunities: number;
  correctCount: number;
  incorrectCount: number;
  lastPracticeAt: string | null;
  hasViewedLearn: boolean;
  firstViewedAt: string | null;
  lastViewedAt: string | null;
  learnViewCount: number;
};

type KnowledgeComponent = {
  id: string;
  active: boolean;
};

type BKTParameters = {
  kcId: string;
  pInit: number;
};

type AttemptRecord = {
  kcId: string;
  outcome: "correct" | "accepted_alternate" | "incorrect";
  countedAsCorrectForBKT: boolean;
  normalizedAnswer: string;
  masteryBefore: number;
  masteryAfter: number;
};

const dataDir = path.resolve(__dirname, "../data");
const seedDir = path.join(dataDir, "seed");
const learnerDir = path.join(dataDir, "learner");

const knowledgeComponentsPath = path.join(seedDir, "knowledgeComponents.json");
const bktParametersPath = path.join(seedDir, "bktParameters.json");
const learnerStatePath = path.join(learnerDir, "learnerState.json");
const attemptHistoryPath = path.join(learnerDir, "attemptHistory.json");

let originalLearnerState = "";
let originalAttemptHistory = "";

async function readJson<T>(filePath: string): Promise<T> {
  return JSON.parse(await fs.readFile(filePath, "utf8")) as T;
}

async function writeJson(filePath: string, data: unknown): Promise<void> {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf8");
}

async function buildBaselineLearnerState(): Promise<LearnerState[]> {
  const kcs = await readJson<KnowledgeComponent[]>(knowledgeComponentsPath);
  const paramsList = await readJson<BKTParameters[]>(bktParametersPath);
  const pInitByKcId = new Map(paramsList.map((params) => [params.kcId, params.pInit]));

  return kcs
    .filter((kc) => kc.active)
    .map((kc) => ({
      kcId: kc.id,
      masteryProbability: pInitByKcId.get(kc.id) ?? 0.2,
      opportunities: 0,
      correctCount: 0,
      incorrectCount: 0,
      lastPracticeAt: null,
      hasViewedLearn: false,
      firstViewedAt: null,
      lastViewedAt: null,
      learnViewCount: 0,
    }));
}

async function resetLearnerData(
  overrides: Record<string, Partial<LearnerState>> = {}
): Promise<void> {
  const learnerState = await buildBaselineLearnerState();
  const updatedLearnerState = learnerState.map((entry) => ({
    ...entry,
    ...overrides[entry.kcId],
  }));

  await writeJson(learnerStatePath, updatedLearnerState);
  await writeJson(attemptHistoryPath, []);
}

async function loadLearnerStateEntry(kcId: string): Promise<LearnerState> {
  const learnerState = await readJson<LearnerState[]>(learnerStatePath);
  const entry = learnerState.find((item) => item.kcId === kcId);

  if (!entry) {
    throw new Error(`Missing learner state for ${kcId}`);
  }

  return entry;
}

describe("practice routes", () => {
  beforeAll(async () => {
    [originalLearnerState, originalAttemptHistory] = await Promise.all([
      fs.readFile(learnerStatePath, "utf8"),
      fs.readFile(attemptHistoryPath, "utf8"),
    ]);
  });

  beforeEach(async () => {
    await resetLearnerData();
  });

  afterAll(async () => {
    await Promise.all([
      fs.writeFile(learnerStatePath, originalLearnerState, "utf8"),
      fs.writeFile(attemptHistoryPath, originalAttemptHistory, "utf8"),
    ]);
  });

  it("GET /api/practice/next prioritizes unseen terms before lower-mastery practiced terms", async () => {
    await resetLearnerData({
      kc_cardiovascular_anemia: {
        masteryProbability: 0.05,
        opportunities: 3,
        correctCount: 1,
        incorrectCount: 2,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
      kc_cardiovascular_blood_vessels: {
        masteryProbability: 0.18,
        opportunities: 1,
        correctCount: 0,
        incorrectCount: 1,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
      kc_urinary_bladder: {
        masteryProbability: 0.12,
        opportunities: 2,
        correctCount: 0,
        incorrectCount: 2,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
    });

    const response = await request(app).get("/api/practice/next");

    expect(response.status).toBe(200);
    expect(response.body.reason).toBe("new_term");
    expect(response.body.kc.id).toBe("kc_cardiovascular_aneurysm");
    expect(response.body.practiceItem.id).toBe("item_cardiovascular_aneurysm_typed_1");
    expect(response.body.learnerState.opportunities).toBe(0);
  });

  it("GET /api/practice/next selects the lowest-mastery candidate when all available terms have been practiced", async () => {
    await resetLearnerData({
      kc_cardiovascular_anemia: {
        masteryProbability: 0.6,
        opportunities: 2,
        correctCount: 2,
        incorrectCount: 0,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
      kc_cardiovascular_aneurysm: {
        masteryProbability: 0.45,
        opportunities: 2,
        correctCount: 1,
        incorrectCount: 1,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
      kc_cardiovascular_blood_vessels: {
        masteryProbability: 0.18,
        opportunities: 2,
        correctCount: 0,
        incorrectCount: 2,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
      kc_skin_blood_vessels: {
        masteryProbability: 0.3,
        opportunities: 1,
        correctCount: 0,
        incorrectCount: 1,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
      kc_urinary_bladder: {
        masteryProbability: 0.25,
        opportunities: 1,
        correctCount: 0,
        incorrectCount: 1,
        lastPracticeAt: "2026-04-16T00:00:00.000Z",
      },
    });

    const response = await request(app).get("/api/practice/next");

    expect(response.status).toBe(200);
    expect(response.body.reason).toBe("low_mastery");
    expect(response.body.kc.id).toBe("kc_cardiovascular_blood_vessels");
    expect(response.body.practiceItem.id).toBe("item_cardiovascular_blood_vessels_typed_1");
    expect(response.body.learnerState.masteryProbability).toBe(0.18);
  });

  it("POST /api/practice/submit records a correct answer and updates learner progress", async () => {
    const response = await request(app)
      .post("/api/practice/submit")
      .send({
        kcId: "kc_cardiovascular_anemia",
        practiceItemId: "item_cardiovascular_anemia_typed_1",
        userAnswer: "Anemia",
      });

    expect(response.status).toBe(200);
    expect(response.body.scoring.outcome).toBe("correct");
    expect(response.body.scoring.countedAsCorrectForBKT).toBe(true);
    expect(response.body.learnerStateBefore.masteryProbability).toBe(0.2);
    expect(response.body.learnerStateAfter.masteryProbability).toBeCloseTo(0.6);
    expect(response.body.learnerStateAfter.opportunities).toBe(1);
    expect(response.body.learnerStateAfter.correctCount).toBe(1);
    expect(response.body.learnerStateAfter.incorrectCount).toBe(0);
    expect(response.body.attemptRecord.outcome).toBe("correct");

    const learnerStateEntry = await loadLearnerStateEntry("kc_cardiovascular_anemia");
    expect(learnerStateEntry.masteryProbability).toBeCloseTo(0.6);
    expect(learnerStateEntry.opportunities).toBe(1);
    expect(learnerStateEntry.correctCount).toBe(1);
    expect(learnerStateEntry.incorrectCount).toBe(0);
    expect(learnerStateEntry.lastPracticeAt).not.toBeNull();

    const attemptHistory = await readJson<AttemptRecord[]>(attemptHistoryPath);
    expect(attemptHistory).toHaveLength(1);
    expect(attemptHistory[0].kcId).toBe("kc_cardiovascular_anemia");
    expect(attemptHistory[0].outcome).toBe("correct");
    expect(attemptHistory[0].countedAsCorrectForBKT).toBe(true);
    expect(attemptHistory[0].normalizedAnswer).toBe("anemia");
    expect(attemptHistory[0].masteryBefore).toBe(0.2);
    expect(attemptHistory[0].masteryAfter).toBeCloseTo(0.6);
  });

  it("POST /api/practice/submit records an incorrect answer and lowers mastery", async () => {
    const response = await request(app)
      .post("/api/practice/submit")
      .send({
        kcId: "kc_urinary_bladder",
        practiceItemId: "item_urinary_bladder_typed_1",
        userAnswer: "corazon",
      });

    expect(response.status).toBe(200);
    expect(response.body.scoring.outcome).toBe("incorrect");
    expect(response.body.scoring.countedAsCorrectForBKT).toBe(false);
    expect(response.body.learnerStateBefore.masteryProbability).toBe(0.2);
    expect(response.body.learnerStateAfter.masteryProbability).toBeCloseTo(0.17575757575757575);
    expect(response.body.learnerStateAfter.opportunities).toBe(1);
    expect(response.body.learnerStateAfter.correctCount).toBe(0);
    expect(response.body.learnerStateAfter.incorrectCount).toBe(1);
    expect(response.body.attemptRecord.outcome).toBe("incorrect");

    const learnerStateEntry = await loadLearnerStateEntry("kc_urinary_bladder");
    expect(learnerStateEntry.masteryProbability).toBeCloseTo(0.17575757575757575);
    expect(learnerStateEntry.opportunities).toBe(1);
    expect(learnerStateEntry.correctCount).toBe(0);
    expect(learnerStateEntry.incorrectCount).toBe(1);
    expect(learnerStateEntry.lastPracticeAt).not.toBeNull();

    const attemptHistory = await readJson<AttemptRecord[]>(attemptHistoryPath);
    expect(attemptHistory).toHaveLength(1);
    expect(attemptHistory[0].kcId).toBe("kc_urinary_bladder");
    expect(attemptHistory[0].outcome).toBe("incorrect");
    expect(attemptHistory[0].countedAsCorrectForBKT).toBe(false);
    expect(attemptHistory[0].normalizedAnswer).toBe("corazon");
    expect(attemptHistory[0].masteryBefore).toBe(0.2);
    expect(attemptHistory[0].masteryAfter).toBeCloseTo(0.17575757575757575);
  });
});
