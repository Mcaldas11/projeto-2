import "dotenv/config";

import app from "./app.js";
import { testConnection } from "./models/index.js";

const HOST = process.env.HOST || "127.0.0.1";
const PORT = Number(process.env.PORT) || 3000;

const startServer = async () => {
  try {
    await testConnection();
    console.log("Database connection established successfully.");

    app.listen(PORT, HOST, () => {
      console.log(`Server running on http://${HOST}:${PORT}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();
