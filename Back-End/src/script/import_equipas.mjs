import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Equipa, Municipio } from "../config/db.config.js";

const seedPath = new URL(
  "../../../Data-Generator/database/seeds/seed_equipas.py",
  import.meta.url,
);

const parseEquipasFromSeed = (seedContent) => {
  const objectMatches = seedContent.match(/\{[^{}]+\}/g) || [];
  return objectMatches.map((entry) => JSON.parse(entry));
};

const loadEquipasSource = async () => {
  const seedRaw = await fs.readFile(seedPath, "utf8");
  const fromSeed = parseEquipasFromSeed(seedRaw).filter(
    (e) => e.idEquipa != null && e.especializacao && e.fregEquipa != null,
  );

  if (fromSeed.length > 0) {
    return fromSeed;
  }

  const raw = await fs.readFile(dataPath, "utf8");
  return JSON.parse(raw);
};

async function importEquipas() {
  try {
    const equipas = await loadEquipasSource();

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
      idEquipa: e.idEquipa ?? index + 1,
      especializacao: e.especializacao,
      fregEquipa: e.fregEquipa,
    }));

    const municipioIds = new Set(
      (await Municipio.findAll({ attributes: ["idFreguesia"] })).map(
        (m) => m.idFreguesia,
      ),
    );
    const missingMunicipios = [
      ...new Set(
        payload.map((e) => e.fregEquipa).filter((id) => !municipioIds.has(id)),
      ),
    ];

    if (missingMunicipios.length > 0) {
      throw new Error(
        `Missing municipios for idFreguesia: ${missingMunicipios.join(", ")}. Import municipios first.`,
      );
    }

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
