import fs from "fs/promises";
import "dotenv/config";
import { sequelize, Mensagem } from "../config/db.config.js";
import { Cidadao, Ocorrencia } from "../config/db.config.js";

const seedPath = new URL(
  "../../../Data-Generator/data/mensagens.json",
  import.meta.url,
);

async function importMensagens() {
  try {
    const raw = await fs.readFile(seedPath, "utf8");
    const mensagens = JSON.parse(raw);

    const cidadaosDb = await Cidadao.findAll({
      attributes: ["idCidadao"],
      raw: true,
    });
    const ocorrenciasDb = await Ocorrencia.findAll({
      attributes: ["idOcorrencia"],
      raw: true,
    });

    const cidadaoIds = cidadaosDb.map((row) => row.idCidadao);
    const ocorrenciaIds = ocorrenciasDb.map((row) => row.idOcorrencia);

    if (cidadaoIds.length === 0) {
      throw new Error(
        "No cidadaos found in the database. Import cidadaos first.",
      );
    }

    if (ocorrenciaIds.length === 0) {
      throw new Error(
        "No ocorrencias found in the database. Import ocorrencias first.",
      );
    }

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

    const payload = mensagens.map((m, index) => ({
      texto: m.texto,
      dataMensagem:
        m.dataMensagem ??
        new Date().toISOString().slice(0, 19).replace("T", " "),
      classificacao: m.classificacao ?? null,
      idCidadao: cidadaoIds[index % cidadaoIds.length],
      idOcorrencia: ocorrenciaIds[index % ocorrenciaIds.length],
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        try {
          await Mensagem.bulkCreate(chunk, {
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
      console.log(`Imported ${payload.length} mensagens successfully.`);

      try {
        const count = await Mensagem.count();
        console.log(`Mensagem table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Mensagem rows:", e.message);
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

importMensagens();
