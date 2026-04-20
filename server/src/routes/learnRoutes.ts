import { Router } from "express";

import type { MedicalSystem, TermType } from "../../../shared/types/kc";
import { getNextLearnTerm, markKCViewedInLearn } from "../services/learnService";

const learnRoutes = Router();

learnRoutes.get("/next", async (req, res) => {
  try {
    const preferredSystem =
      typeof req.query.preferredSystem === "string" ? req.query.preferredSystem : undefined;
    const preferredTermType =
      typeof req.query.preferredTermType === "string" ? req.query.preferredTermType : undefined;
    const excludeKcIds =
      typeof req.query.excludeKcIds === "string" && req.query.excludeKcIds.length > 0
        ? req.query.excludeKcIds.split(",").map((value) => value.trim()).filter(Boolean)
        : undefined;

    const result = await getNextLearnTerm({
      preferredSystem: preferredSystem as MedicalSystem | undefined,
      preferredTermType: preferredTermType as TermType | undefined,
      excludeKcIds,
    });

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to get next Learn term.",
      details: message,
    });
  }
});

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
