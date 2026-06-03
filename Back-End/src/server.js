import "./config/env.js";

import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import {
  errorHandlerMiddleware,
  notFoundMiddleware,
} from "./middlewares/error.middleware.js";
import apiRoutes from "./routes/index.js";
import { syncDatabase, testConnection } from "./config/db.config.js";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

app.use(express.json());

// CORS: use the cors package for clearer, configurable handling
// In development reflect the request origin (useful when Vite chooses a different port)
const corsOptions = {
  origin:
    process.env.NODE_ENV === "production"
      ? process.env.CORS_ORIGIN || "https://yourapp.com"
      : true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
};

app.use(cors(corsOptions));

// Serve uploaded files
app.use("/uploads", express.static(path.join(__dirname, "..", "uploads")));

app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

app.use("/", apiRoutes);

app.use(notFoundMiddleware);
app.use(errorHandlerMiddleware);

const startServer = async () => {
  try {
    await testConnection();
    console.log("Database connection established successfully.");

    const didSync = await syncDatabase();
    if (didSync) {
      console.log("Database schema synced successfully.");
    }

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
