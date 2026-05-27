import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import { sequelize, Ocorrencia } from "../config/db.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const dataPath = process.env.OCORRENCIAS_DATA_PATH
  ? path.resolve(process.env.OCORRENCIAS_DATA_PATH)
  : path.resolve(__dirname, "../../../Data-Generator/data/ocorrencias.json");

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

async function updateOcorrenciaFotos() {
  try {
    const raw = await fs.readFile(dataPath, "utf8");
    const ocorrencias = JSON.parse(raw);

    let updated = 0;
    let skipped = 0;
    let missing = 0;

    const transaction = await sequelize.transaction();
    try {
      for (const ocorrencia of ocorrencias) {
        const id = ocorrencia.idOcorrencia;
        if (!id) {
          skipped += 1;
          continue;
        }

        const foto = normalizeFotoValue(ocorrencia.foto);
        if (!foto) {
          skipped += 1;
          continue;
        }

        const [count] = await Ocorrencia.update(
          { foto },
          { where: { idOcorrencia: id }, transaction },
        );

        if (count === 0) {
          missing += 1;
        } else {
          updated += 1;
        }
      }

      await transaction.commit();
    } catch (error) {
      await transaction.rollback();
      throw error;
    } finally {
      await sequelize.close();
    }

    console.log(
      `Done. Updated: ${updated}, skipped: ${skipped}, missing: ${missing}.`,
    );
    console.log(`Source: ${dataPath}`);
  } catch (error) {
    console.error("Update failed:", error.message);
    process.exit(1);
  }
}

updateOcorrenciaFotos();
