import fs from "fs/promises";
import "dotenv/config";
import { Op } from "sequelize";
import { sequelize, Municipio, Trabalhador } from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/municipio.json",
  import.meta.url,
);

async function importResponsaveis() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const responsaveis = JSON.parse(raw);

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

    const municipioPayload = responsaveis.map((r) => ({
      nome: r.nome,
      responsavel: r.responsavel ?? null,
    }));

    const trabalhadorPayload = responsaveis.map((r) => ({
      nomeTrabalhador: r.responsavel,
      emailTrabalhador: r.email,
      telemovelTrabalhador: r.telemovel,
      idEquipa: null,
      idFreguesia: r.idFreguesia ?? null,
      credenciaisTrabalhadores: r.credenciaisTrabalhadores ?? null,
    }));

    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
    try {
      await Municipio.destroy({ truncate: true });
    } finally {
      await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
    }

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      const deletedCount = await Trabalhador.destroy({
        where: {
          emailTrabalhador: {
            [Op.like]: "responsavel.%",
          },
        },
        transaction,
      });

      for (let i = 0; i < municipioPayload.length; i += chunkSize) {
        const chunk = municipioPayload.slice(i, i + chunkSize);
        await Municipio.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
          updateOnDuplicate: ["responsavel"],
        });
      }

      for (let i = 0; i < trabalhadorPayload.length; i += chunkSize) {
        const chunk = trabalhadorPayload.slice(i, i + chunkSize);
        await Trabalhador.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
          updateOnDuplicate: [
            "nomeTrabalhador",
            "telemovelTrabalhador",
            "idEquipa",
            "idFreguesia",
            "credenciaisTrabalhadores",
          ],
        });
      }

      await transaction.commit();
      console.log(
        `Deleted ${deletedCount} old responsaveis without credentials.`,
      );
      console.log(
        `Imported ${municipioPayload.length} responsaveis successfully.`,
      );

      try {
        const count = await Municipio.count();
        console.log(`Municipio table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Municipio rows:", e.message);
      }

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

importResponsaveis();
