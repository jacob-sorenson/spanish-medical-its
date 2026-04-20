import { promises as fs } from "fs";
import path from "path";

import request from "supertest";
import { afterAll, beforeAll, beforeEach, describe, expect, it, vi } from "vitest";

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

const dataDir = path.resolve(__dirname, "../data");
const seedDir = path.join(dataDir, "seed");
const learnerDir = path.join(dataDir, "learner");

const knowledgeComponentsPath = path.join(seedDir, "knowledgeComponents.json");
const bktParametersPath = path.join(seedDir, "bktParameters.json");
const learnerStatePath = path.join(learnerDir, "learnerState.json");

let originalLearnerState = "";

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
}

describe("learn routes", () => {
  beforeAll(async () => {
    originalLearnerState = await fs.readFile(learnerStatePath, "utf8");
  });

  beforeEach(async () => {
    vi.restoreAllMocks();
    await resetLearnerData();
  });

  afterAll(async () => {
    await fs.writeFile(learnerStatePath, originalLearnerState, "utf8");
  });

  it("GET /api/learn/next prioritizes unseen terms and does not default to alphabetical order", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0.99);

    await resetLearnerData({
      kc_cardiovascular_anemia: {
        hasViewedLearn: true,
        firstViewedAt: "2026-04-20T00:00:00.000Z",
        lastViewedAt: "2026-04-20T00:00:00.000Z",
        learnViewCount: 1,
      },
      kc_cardiovascular_aneurysm: {
        hasViewedLearn: true,
        firstViewedAt: "2026-04-20T00:00:00.000Z",
        lastViewedAt: "2026-04-20T00:00:00.000Z",
        learnViewCount: 1,
      },
    });

    const response = await request(app).get("/api/learn/next?preferredSystem=cardiovascular");

    expect(response.status).toBe(200);
    expect(response.body.reason).toBe("unseen_term");
    expect(response.body.kc.id).toBe("kc_cardiovascular_cholesterol");
    expect(response.body.learnerState.hasViewedLearn).toBe(false);
  });

  it("GET /api/learn/next prioritizes low-mastery review after all filtered terms have been seen", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    await resetLearnerData({
      kc_cardiovascular_anemia: {
        hasViewedLearn: true,
        masteryProbability: 0.6,
        learnViewCount: 3,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-19T00:00:00.000Z",
      },
      kc_cardiovascular_aneurysm: {
        hasViewedLearn: true,
        masteryProbability: 0.18,
        learnViewCount: 2,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-18T00:00:00.000Z",
      },
      kc_cardiovascular_angina: {
        hasViewedLearn: true,
        masteryProbability: 0.24,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-17T00:00:00.000Z",
      },
      kc_cardiovascular_aorta: {
        hasViewedLearn: true,
        masteryProbability: 0.3,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-16T00:00:00.000Z",
      },
      kc_cardiovascular_arrythmia: {
        hasViewedLearn: true,
        masteryProbability: 0.4,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-15T00:00:00.000Z",
      },
      kc_cardiovascular_blood_test: {
        hasViewedLearn: true,
        masteryProbability: 0.5,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-14T00:00:00.000Z",
      },
      kc_cardiovascular_blood_vessels: {
        hasViewedLearn: true,
        masteryProbability: 0.7,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-13T00:00:00.000Z",
      },
      kc_cardiovascular_bone_marrow: {
        hasViewedLearn: true,
        masteryProbability: 0.8,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-12T00:00:00.000Z",
      },
      kc_cardiovascular_capillaries: {
        hasViewedLearn: true,
        masteryProbability: 0.9,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-11T00:00:00.000Z",
      },
      kc_cardiovascular_cholesterol: {
        hasViewedLearn: true,
        masteryProbability: 0.95,
        learnViewCount: 1,
        firstViewedAt: "2026-04-10T00:00:00.000Z",
        lastViewedAt: "2026-04-10T00:00:00.000Z",
      },
    });

    const response = await request(app).get("/api/learn/next?preferredSystem=cardiovascular");

    expect(response.status).toBe(200);
    expect(response.body.reason).toBe("guided_review");
    expect(response.body.kc.id).toBe("kc_cardiovascular_aneurysm");
    expect(response.body.learnerState.masteryProbability).toBe(0.18);
  });

  it("GET /api/learn/next respects excludeKcIds when choosing the next recommendation", async () => {
    vi.spyOn(Math, "random").mockReturnValue(0);

    await resetLearnerData({
      kc_cardiovascular_anemia: {
        hasViewedLearn: false,
      },
      kc_cardiovascular_aneurysm: {
        hasViewedLearn: false,
      },
      kc_cardiovascular_angina: {
        hasViewedLearn: true,
      },
      kc_cardiovascular_aorta: {
        hasViewedLearn: true,
      },
    });

    const response = await request(app).get(
      "/api/learn/next?preferredSystem=cardiovascular&excludeKcIds=kc_cardiovascular_anemia"
    );

    expect(response.status).toBe(200);
    expect(response.body.kc.id).not.toBe("kc_cardiovascular_anemia");
    expect(response.body.kc.id).toBe("kc_cardiovascular_aneurysm");
  });
});
