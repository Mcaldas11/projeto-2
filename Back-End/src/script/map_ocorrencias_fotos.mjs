import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import cloudinary from "../config/cloudinary.js";
import { Ocorrencia } from "../config/db.config.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_DATA_PATH = path.resolve(
  __dirname,
  "../../../Data-Generator/data/ocorrencias.json",
);

const resolveOptionalPath = (value) => (value ? path.resolve(value) : null);

const config = {
  dataPath: resolveOptionalPath(process.env.OCORRENCIAS_DATA_PATH) ||
    DEFAULT_DATA_PATH,
  localDir: resolveOptionalPath(process.env.OCORRENCIAS_FOTO_LOCAL_DIR),
  uploadFolder: process.env.OCORRENCIAS_FOTO_FOLDER || "ocorrencias/seed",
};

const mapping = [
  { id: 1, label: "buraco" },
  { id: 2, label: "passeio" },
  { id: 3, label: "calcada" },
  { id: 4, label: "asfalto" },
  { id: 5, label: "semaforo" },
  { id: 6, label: "sinal" },
  { id: 7, label: "marcas_via" },
  { id: 8, label: "sinal_danificado" },
  { id: 9, label: "candeeiro" },
  { id: 10, label: "lampada" },
  { id: 11, label: "varios_candeeiros" },
  { id: 12, label: "zona_sem_iluminacao" },
  { id: 13, label: "lixo_acumulado" },
  { id: 14, label: "rua_suja" },
  { id: 15, label: "mato_berma" },
  { id: 16, label: "arvore_parque" },
  { id: 17, label: "banco_partido" },
  { id: 18, label: "relva_alta" },
];

const ensureCloudinaryEnv = () => {
  const missing = [
    "CLOUDINARY_CLOUD_NAME",
    "CLOUDINARY_API_KEY",
    "CLOUDINARY_API_SECRET",
  ].filter((key) => !process.env[key]);

  if (missing.length) {
    throw new Error(
      `Missing Cloudinary env vars: ${missing.join(", ")}. Add them to Back-End/.env.`,
    );
  }
};

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

const slugify = (value) =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "");

const loadLocalFotos = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => {
      const fullPath = path.join(dir, entry.name);
      const ext = path.extname(entry.name).toLowerCase();
      const base = path.basename(entry.name, ext);
      return {
        path: fullPath,
        slug: slugify(base),
        ext,
      };
    })
    .filter((file) => imageExtensions.has(file.ext));

  return files.sort((a, b) =>
    a.path.localeCompare(b.path, undefined, {
      numeric: true,
      sensitivity: "base",
    }),
  );
};

const pickFileForLabel = (label, files, used) => {
  const target = slugify(label);

  const exact = files.find(
    (file) => file.slug === target && !used.has(file.path),
  );
  if (exact) return exact;

  return files.find(
    (file) => file.slug.includes(target) && !used.has(file.path),
  );
};

const uploadLocalFile = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: config.uploadFolder,
    resource_type: "image",
  });

  return result?.secure_url || result?.url || null;
};

async function mapOcorrenciasFotos() {
  ensureCloudinaryEnv();

  if (!config.localDir) {
    throw new Error("Set OCORRENCIAS_FOTO_LOCAL_DIR to the photo folder.");
  }

  const localFiles = await loadLocalFotos(config.localDir);
  if (localFiles.length === 0) {
    throw new Error(`No image files found in ${config.localDir}`);
  }

  const raw = await fs.readFile(config.dataPath, "utf8");
  const ocorrencias = JSON.parse(raw);
  const ocorrenciasById = new Map(
    ocorrencias.map((item) => [Number(item.idOcorrencia), item]),
  );

  const usedFiles = new Set();
  let updated = 0;
  let missing = 0;
  let notFound = 0;

  for (const item of mapping) {
    const file = pickFileForLabel(item.label, localFiles, usedFiles);
    if (!file) {
      missing += 1;
      console.warn(`Missing photo for ocorrencia ${item.id} (${item.label}).`);
      continue;
    }

    const url = await uploadLocalFile(file.path);
    if (!url) {
      missing += 1;
      console.warn(`Upload failed for ${file.path}.`);
      continue;
    }

    const [count] = await Ocorrencia.update(
      { foto: JSON.stringify([url]) },
      { where: { idOcorrencia: item.id } },
    );

    if (count === 0) {
      notFound += 1;
      console.warn(`Ocorrencia ${item.id} not found in DB.`);
      continue;
    }

    const ocorrencia = ocorrenciasById.get(item.id);
    if (ocorrencia) {
      ocorrencia.foto = [url];
    }

    usedFiles.add(file.path);
    updated += 1;
    console.log(`Mapped ocorrencia ${item.id} -> ${path.basename(file.path)}`);
  }

  await fs.writeFile(
    config.dataPath,
    JSON.stringify(ocorrencias, null, 2),
    "utf8",
  );

  console.log(
    `Done. Updated: ${updated}, missing photos: ${missing}, missing ocorrencias: ${notFound}.`,
  );
  console.log(`Saved: ${config.dataPath}`);
}

mapOcorrenciasFotos().catch((error) => {
  console.error("Mapping failed:", error.message);
  process.exit(1);
});
