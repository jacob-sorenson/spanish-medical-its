import express from "express";

import practiceRoutes from "./routes/practiceRoutes";

const app = express();

app.use(express.json());
app.use("/api/practice", practiceRoutes);

export default app;
