

import { Router } from "express";

import { getNextPracticeItem, submitPracticeAnswer } from "../services/practiceService";

const practiceRoutes = Router();

practiceRoutes.get("/next", async (_req, res) => {
  try {
    const result = await getNextPracticeItem();

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to get next practice item.",
      details: message,
    });
  }
});

practiceRoutes.post("/submit", async (req, res) => {
  try {
    const { kcId, practiceItemId, userAnswer } = req.body ?? {};

    if (!kcId || typeof kcId !== "string") {
      return res.status(400).json({
        error: "A valid kcId is required.",
      });
    }

    if (!practiceItemId || typeof practiceItemId !== "string") {
      return res.status(400).json({
        error: "A valid practiceItemId is required.",
      });
    }

    if (typeof userAnswer !== "string") {
      return res.status(400).json({
        error: "A valid userAnswer string is required.",
      });
    }

    const result = await submitPracticeAnswer({
      kcId,
      practiceItemId,
      userAnswer,
    });

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to submit practice answer.",
      details: message,
    });
  }
});

export default practiceRoutes;