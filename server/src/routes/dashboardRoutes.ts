import { Router } from "express";

import { getDashboardData } from "../services/dashboardService";

const dashboardRoutes = Router();

dashboardRoutes.get("/", async (_req, res) => {
  try {
    const result = await getDashboardData();

    return res.status(200).json(result);
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";

    return res.status(500).json({
      error: "Failed to get dashboard data.",
      details: message,
    });
  }
});

export default dashboardRoutes;
