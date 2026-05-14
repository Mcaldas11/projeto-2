import express from "express";
import "dotenv/config";
import { sequelize, models } from "./models/db.js";

const app = express();

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

app.use(express.json());

// Example endpoint to test models
app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    message: "API is running",
    models: Object.keys(models),
  });
});

// Example: Get all municipios
app.get("/municipios", async (req, res) => {
  try {
    const municipios = await models.Municipio.findAll();
    res.json(municipios);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, HOST, () => {
  console.log(`✓ Server is running on http://${HOST}:${PORT}`);
});
