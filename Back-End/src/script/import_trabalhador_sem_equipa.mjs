import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Trabalhador } from "../config/db.config.js";

// Usage: node import_trabalhador_sem_equipa.mjs [path-to-json]
// Default JSON: ../../../Data-Generator/data/trabalhador.json
const argv = process.argv.slice(2);
const userPath = argv.find((v) => !v.startsWith("--"));
const dataPath = userPath
  ? new URL(userPath, import.meta.url)
  : new URL(
      "../../../Data-Generator/data/trabalhador_sem_equipa.json",
      import.meta.url,
    );

async function importSemEquipa() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    let trabalhadores = JSON.parse(raw);

    // Keep only those without a team
    const before = trabalhadores.length;
    trabalhadores = trabalhadores.filter((t) => t.idEquipa == null);
    console.log(`Filtered sem equipa: ${before} -> ${trabalhadores.length}`);

    if (trabalhadores.length === 0) {
      console.log("No trabalhadores sem equipa to import.");
      return;
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
      console.log(
        `Imported ${payload.length} trabalhadores sem equipa successfully.`,
      );

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

importSemEquipa();
