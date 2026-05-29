import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Cidadao, Municipio } from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/cidadao.json",
  import.meta.url,
);

async function importCidadaos() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const cidadaos = JSON.parse(raw);

    const normalizeText = (value) =>
      String(value ?? "")
        .normalize("NFD")
        .replace(/\p{Diacritic}/gu, "")
        .toLowerCase()
        .trim();

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

    const municipios = await Municipio.findAll();
    const municipioMap = new Map(
      municipios.map((m) => [normalizeText(m.nome), m.idFreguesia]),
    );

    const payload = cidadaos.map((c) => {
      const munCid = municipioMap.get(normalizeText(c.freguesias));

      if (munCid == null) {
        throw new Error(`No municipio found for freguesia: ${c.freguesias}`);
      }

      return {
        nome: c.nome,
        email: c.email,
        nrTelemovel: c.nrTelemovel ?? null,
        fregCidadao: munCid,
      };
    });

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        try {
          await Cidadao.bulkCreate(chunk, {
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
      console.log(`Imported ${payload.length} cidadaos successfully.`);
      try {
        const count = await Cidadao.count();
        console.log(`Cidadao table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Cidadao rows:", e.message);
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

importCidadaos();
