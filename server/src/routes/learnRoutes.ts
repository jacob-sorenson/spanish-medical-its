import { Router } from "express";

import { markKCViewedInLearn } from "../services/learnService";

const learnRoutes = Router();

learnRoutes.post("/view", async (req, res) => {
  try {
    const { kcId } = req.body ?? {};

    if (!kcId || typeof kcId !== "string") {
      return res.status(400).json({
        error: "A valid kcId is required.",
      });
    }

    const updatedLearnerState = await markKCViewedInLearn(kcId);

    return res.status(200).json(updatedLearnerState);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to mark KC as viewed in Learn.",
      details: message,
    });
  }
});

export default learnRoutes;
