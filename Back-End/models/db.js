import { Sequelize } from "sequelize";
import dbConfig from "./db.config.js";
import { initializeModels } from "./index.js";

const sequelize = new Sequelize(
  dbConfig.database,
  dbConfig.username,
  dbConfig.password,
  dbConfig,
);

// Test connection
try {
  await sequelize.authenticate();
  console.log("Database connection established successfully.");
} catch (error) {
  console.error("Unable to connect to the database:", error);
  process.exit(1);
}

// Initialize all models
const models = initializeModels(sequelize);

export { sequelize, models };
