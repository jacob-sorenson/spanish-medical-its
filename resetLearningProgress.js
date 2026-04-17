#!/usr/bin/env node

const fs = require("fs");
const path = require("path");

const repoRoot = __dirname;
const learnerDataDir = path.join(repoRoot, "server/src/data/learner");
const learnerStateSeedPath = path.join(
  learnerDataDir,
  "learnerState.seed.json"
);
const attemptHistorySeedPath = path.join(
  learnerDataDir,
  "attemptHistory.seed.json"
);
const learnerStatePath = path.join(
  learnerDataDir,
  "learnerState.json"
);
const attemptHistoryPath = path.join(
  learnerDataDir,
  "attemptHistory.json"
);

function fail(message) {
  console.error(`Reset failed: ${message}`);
  process.exit(1);
}

function readSeedJson(filePath) {
  if (!fs.existsSync(filePath)) {
    fail(`Missing seed file: ${path.relative(repoRoot, filePath)}`);
  }

  try {
    return JSON.parse(fs.readFileSync(filePath, "utf8"));
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown JSON error";
    fail(`Invalid JSON in seed file ${path.relative(repoRoot, filePath)}: ${message}`);
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, JSON.stringify(value, null, 2) + "\n", "utf8");
  console.log(`Wrote ${path.relative(repoRoot, filePath)}`);
}

function main() {
  const learnerStateSeed = readSeedJson(learnerStateSeedPath);
  const attemptHistorySeed = readSeedJson(attemptHistorySeedPath);

  writeJson(learnerStatePath, learnerStateSeed);
  writeJson(attemptHistoryPath, attemptHistorySeed);

  console.log("Learner progress reset completed successfully.");
}

main();
