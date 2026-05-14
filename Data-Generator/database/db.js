import { Sequelize } from "sequelize";
import config from "./config/database.js";
import { initializeModels } from "./models/index.js";

// Initialize sequelize with config
const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config,
);

// Test connection
try {
  await sequelize.authenticate();
  console.log("Database connection established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
  process.exit(1);
}

// Initialize all models from shared location
const models = initializeModels(sequelize);

export { sequelize, models };
