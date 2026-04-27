import express from "express";

import { errorHandlerMiddleware, notFoundMiddleware } from "./middlewares.js";
import apiRoutes from "./routes/index.js";

const app = express();

app.use(express.json());

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/api", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

export default app;
