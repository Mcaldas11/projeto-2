/*Purpose: This script is responsible for importing worker data from a JSON file into the database. It reads the data from the specified JSON file, processes it, and then uses Sequelize's bulkCreate method to insert the data into the Trabalhador table in chunks. 
It also handles transactions to ensure data integrity and logs the results of the import process. If any errors occur during the import, they are caught and logged, and the process exits with an error code.*/

import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Trabalhador } from "../config/db.config.js";

// Path to generated workers JSON (from project root Data-Generator)
const dataPath = new URL(
  "../../../Data-Generator/data/trabalhador.json",
  import.meta.url,
);

async function importTrabalhadores() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const trabalhadores = JSON.parse(raw);

    // Log DB connection info to help debug which database we're writing to
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

    const payload = trabalhadores.map((t) => ({
      nomeTrabalhador: t.nomeTrabalhador,
      emailTrabalhador: t.emailTrabalhador,
      telemovelTrabalhador: t.telemovelTrabalhador,
      idEquipa: t.idEquipa,
      credenciaisTrabalhadores: t.credenciaisTrabalhadores ?? null,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        try {
          await Trabalhador.bulkCreate(chunk, {
            transaction,
            validate: false,
            ignoreDuplicates: true,
          });
        } catch (err) {
          console.error("Chunk insert error:", err);
          throw err;
        }
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} trabalhadores successfully.`);
      // Count rows to confirm
      try {
        const count = await Trabalhador.count();
        console.log(`Trabalhador table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Trabalhador rows:", e.message);
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

importTrabalhadores();
