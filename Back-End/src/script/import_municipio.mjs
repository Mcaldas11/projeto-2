import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Municipio } from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/municipio.json",
  import.meta.url,
);

async function importMunicipios() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const municipios = JSON.parse(raw);

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

    const payload = municipios.map((m) => ({
      nome: m.nome,
      responsavel: m.responsavel ?? null,
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Municipio.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }
      await transaction.commit();
      console.log(`Imported ${payload.length} municipios successfully.`);

      try {
        const count = await Municipio.count();
        console.log(`Municipio table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Municipio rows:", e.message);
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

importMunicipios();
