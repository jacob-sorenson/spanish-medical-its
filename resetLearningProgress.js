#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = __dirname;
const knowledgeComponentsPath = path.join(
  repoRoot,
  "server/src/data/seed/knowledgeComponents.json"
);
const bktParametersPath = path.join(
  repoRoot,
  "server/src/data/seed/bktParameters.json"
);
const learnerStatePath = path.join(
  repoRoot,
  "server/src/data/learner/learnerState.json"
);
const attemptHistoryPath = path.join(
  repoRoot,
  "server/src/data/learner/attemptHistory.json"
);

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n");
}

function main() {
  const kcs = readJson(knowledgeComponentsPath);
  const bktParameters = readJson(bktParametersPath);
  const pInitByKcId = new Map(
    bktParameters.map((params) => [params.kcId, params.pInit])
  );

  const learnerState = kcs
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

  writeJson(learnerStatePath, learnerState);
  writeJson(attemptHistoryPath, []);

  console.log(
    `Reset learner progress for ${learnerState.length} active knowledge components.`
  );
  console.log(`Updated ${path.relative(repoRoot, learnerStatePath)}`);
  console.log(`Updated ${path.relative(repoRoot, attemptHistoryPath)}`);
}

main();
