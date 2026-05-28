import fs from "fs/promises";
import "dotenv/config";
import {
  sequelize,
  Ocorrencia,
  Cidadao,
  Municipio,
  Equipa,
} from "../config/db.config.js";

const dataPath = new URL(
  "../../../Data-Generator/data/ocorrencias.json",
  import.meta.url,
);

const normalizeDate = (value) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toISOString().slice(0, 19).replace("T", " ");
};

const normalizeFotoValue = (value) => {
  if (!value) return null;

  if (Array.isArray(value)) {
    const urls = value
      .map((entry) => {
        if (typeof entry === "string") return entry;
        if (entry && typeof entry === "object") {
          return entry.url || entry.secure_url || null;
        }
        return null;
      })
      .filter(Boolean);

    return urls.length ? JSON.stringify(urls) : null;
  }

  if (typeof value === "string") return value;

  return null;
};

async function importOcorrencias() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const ocorrencias = JSON.parse(raw);

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

    await Ocorrencia.sync({ alter: true });

    const cidadaoIds = new Set(
      (await Cidadao.findAll({ attributes: ["idCidadao"], raw: true })).map(
        (c) => c.idCidadao,
      ),
    );
    const municipioIds = new Set(
      (await Municipio.findAll({ attributes: ["idFreguesia"], raw: true })).map(
        (m) => m.idFreguesia,
      ),
    );
    const equipaIds = new Set(
      (await Equipa.findAll({ attributes: ["idEquipa"], raw: true })).map(
        (e) => e.idEquipa,
      ),
    );

    const missingCidadaos = [
      ...new Set(
        ocorrencias.map((o) => o.idCidadao).filter((id) => !cidadaoIds.has(id)),
      ),
    ];
    const missingMunicipios = [
      ...new Set(
        ocorrencias
          .map((o) => o.idFreguesia)
          .filter((id) => !municipioIds.has(id)),
      ),
    ];
    const missingEquipas = [
      ...new Set(
        ocorrencias
          .map((o) => o.idEquipa)
          .filter((id) => id != null && !equipaIds.has(id)),
      ),
    ];

    if (missingCidadaos.length > 0) {
      throw new Error(
        `Missing cidadaos for idCidadao: ${missingCidadaos.join(", ")}. Import cidadaos first.`,
      );
    }

    if (missingMunicipios.length > 0) {
      throw new Error(
        `Missing municipios for idFreguesia: ${missingMunicipios.join(", ")}. Import municipios first.`,
      );
    }

    if (missingEquipas.length > 0) {
      throw new Error(
        `Missing equipas for idEquipa: ${missingEquipas.join(", ")}. Import equipas first.`,
      );
    }

    const payload = ocorrencias.map((o) => ({
      idOcorrencia: o.idOcorrencia,
      foto: normalizeFotoValue(o.foto),
      descricao: o.descricao,
      localizacao: o.localizacao,
      dataOcorrencia: normalizeDate(o.dataOcorrencia),
      nomeAutor: o.nomeAutor,
      nrTelemovelAutor: o.nrTelemovelAutor,
      severidade: o.severidade,
      estado: o.estado,
      idCidadao: o.idCidadao,
      idFreguesia: o.idFreguesia,
      idEquipa: o.idEquipa ?? null,
      dataAgendada: normalizeDate(o.dataAgendada),
      feedback: o.feedback ?? null,
      tipo_ocorrencia: o.tipo_ocorrencia,
      dataResolucao: normalizeDate(o.dataResolucao),
    }));

    const chunkSize = 500;
    const transaction = await sequelize.transaction();
    try {
      for (let i = 0; i < payload.length; i += chunkSize) {
        const chunk = payload.slice(i, i + chunkSize);
        await Ocorrencia.bulkCreate(chunk, {
          transaction,
          validate: false,
          ignoreDuplicates: true,
        });
      }

      await transaction.commit();
      console.log(`Imported ${payload.length} ocorrencias successfully.`);

      try {
        const count = await Ocorrencia.count();
        console.log(`Ocorrencia table row count: ${count}`);
      } catch (e) {
        console.log("Could not count Ocorrencia rows:", e.message);
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

importOcorrencias();
