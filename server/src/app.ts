import express from "express";

import dashboardRoutes from "./routes/dashboardRoutes";
import kcRoutes from "./routes/kcRoutes";
import learnRoutes from "./routes/learnRoutes";
import practiceRoutes from "./routes/practiceRoutes";

const app = express();

app.use(express.json());
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/kcs", kcRoutes);
app.use("/api/learn", learnRoutes);
app.use("/api/practice", practiceRoutes);

export default app;
