import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Recurso, Equipa } from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/recursos.json",
  import.meta.url,
);

async function importRecursos() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const recursos = JSON.parse(raw);

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

    // Garante apenas a tabela recurso antes do insert, sem tocar nas restantes FKs.
    await Recurso.sync({ alter: true });

    const payload = recursos.map((r, index) => ({
      idRecurso: r.idRecurso ?? index + 1,
      tipo: r.tipo,
      estado: r.estado,
      especificacoes: r.especificacoes ?? null,
      localizacao: r.localizacao,
      equipaResponsavel: r.equipaResponsavel,
    }));

    const equipaIds = new Set(
      (await Equipa.findAll({ attributes: ["idEquipa"] })).map(
        (e) => e.idEquipa,
      ),
    );

    const missingEquipas = [
      ...new Set(
        payload
          .map((r) => r.equipaResponsavel)
          .filter((id) => !equipaIds.has(id)),
      ),
    ];

    if (missingEquipas.length > 0) {
      throw new Error(
        `Missing equipas for idEquipa: ${missingEquipas.join(", ")}. Import equipas first.`,
      );
    }

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Recurso.bulkCreate(chunk, {
          transaction,
          validate: false,
          updateOnDuplicate: [
            "tipo",
            "estado",
            "especificacoes",
            "localizacao",
            "equipaResponsavel",
          ],
        });
      }

      await transaction.commit();
      console.log(`Imported ${payload.length} recursos successfully.`);

      try {
        const count = await Recurso.count();
        console.log(`Recurso table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Recurso rows:", e.message);
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

importRecursos();
