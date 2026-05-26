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

    // Garante apenas a tabela equipa antes do insert, sem tocar nas restantes FKs.
    await Equipa.sync({ alter: true });

    const payload = equipas.map((e, index) => ({
      idEquipa: index + 1,
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
          updateOnDuplicate: ["especializacao", "fregEquipa"],
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
