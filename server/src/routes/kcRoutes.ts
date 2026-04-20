import { Router } from "express";

import { loadKnowledgeComponents } from "../services/practiceService";

const kcRoutes = Router();

kcRoutes.get("/", async (_req, res) => {
  try {
    const kcs = await loadKnowledgeComponents();

    return res.status(200).json({
      kcs: kcs.filter((kc) => kc.active),
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to get knowledge components.",
      details: message,
    });
  }
});

export default kcRoutes;
