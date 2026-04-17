import express from "express";

import dashboardRoutes from "./routes/dashboardRoutes";
import practiceRoutes from "./routes/practiceRoutes";

const app = express();

app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/practice", practiceRoutes);

export default app;
