import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Equipa } from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/equipa.json",
  import.meta.url,
);

async function importEquipas() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const equipas = JSON.parse(raw);

    try {
      console.log(
        "DB:",
        sequelize.config.database,
        "HOST:",
        sequelize.config.host,
        "DIALECT:",
        sequelize.getDialect(),
      );
    } catch (e) {
      console.log("Could not read sequelize config:", e.message);
    }

    const payload = equipas.map((e) => ({
      especializacao: e.especializacao,
      fregEquipa: e.fregEquipa,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Equipa.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }

      await transaction.commit();
      console.log(`Imported ${payload.length} equipas successfully.`);

      try {
        const count = await Equipa.count();
        console.log(`Equipa table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Equipa rows:", e.message);
      }
    } catch (err) {
      await transaction.rollback();
      throw err;
    } finally {
      await sequelize.close();
    }
  } catch (err) {
    console.error("Import failed:", err);
    process.exit(1);
  }
}

importEquipas();
