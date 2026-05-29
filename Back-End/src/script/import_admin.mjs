import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Trabalhador } from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/admin.json",
  import.meta.url,
);

async function importAdmin() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const admin = JSON.parse(raw);

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

    const payload = [
      {
        nomeTrabalhador: admin.nome,
        emailTrabalhador: admin.email,
        telemovelTrabalhador: admin.telemovel,
        idEquipa: null,
        credenciaisTrabalhadores: admin.credenciaisTrabalhadores ?? null,
      },
    ];

    const transaction = await sequelize.transaction();
    try {
      await Trabalhador.bulkCreate(payload, {
        transaction,
        validate: false,
        ignoreDuplicates: true,
      });

      await transaction.commit();
      console.log(`Imported ${payload.length} admin successfully.`);

      try {
        const count = await Trabalhador.count({
          where: { emailTrabalhador: admin.email },
        });
        console.log(`Admin rows found: ${count}`);
      } catch (e) {
        console.log("Could not count admin rows:", e.message);
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

importAdmin();
