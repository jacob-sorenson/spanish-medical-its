import cors from "cors";

import app from "./app";

const PORT = 3001;

app.use(cors());

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});