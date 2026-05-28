import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import "dotenv/config";
import cloudinary from "../config/cloudinary.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_DATA_PATH = path.resolve(
  __dirname,
  "../../../Data-Generator/data/ocorrencias.json",
);

const resolveOptionalPath = (value) => (value ? path.resolve(value) : null);

const readEnvInt = (name, fallback) => {
  const value = Number.parseInt(process.env[name] || "", 10);
  return Number.isFinite(value) && value > 0 ? value : fallback;
};

const readEnvBool = (name, fallback = false) => {
  const raw = process.env[name];
  if (raw === undefined) return fallback;
  return raw === "true";
};

const config = {
  dataPath: resolveOptionalPath(process.env.OCORRENCIAS_DATA_PATH) ||
    DEFAULT_DATA_PATH,
  maxFotos: readEnvInt("OCORRENCIAS_FOTO_MAX", 1),
  forceUpdate: readEnvBool("OCORRENCIAS_FOTO_FORCE"),
  uploadFolder: process.env.OCORRENCIAS_FOTO_FOLDER || "ocorrencias/seed",
  localDir: resolveOptionalPath(process.env.OCORRENCIAS_FOTO_LOCAL_DIR),
};

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

const normalizeStringList = (items) =>
  items.filter((item) => typeof item === "string" && item.trim());

const parseFotoValue = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return normalizeStringList(value);
  }

  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    if (Array.isArray(parsed)) {
      return normalizeStringList(parsed);
    }
  } catch {
    return value.trim() ? [value] : [];
  }

  return [];
};

const imageExtensions = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp"]);

const loadLocalFotos = async (dir) => {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = entries
    .filter((entry) => entry.isFile())
    .map((entry) => path.join(dir, entry.name))
    .filter((filePath) =>
      imageExtensions.has(path.extname(filePath).toLowerCase()),
    );

  return files.sort((a, b) =>
    a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" }),
  );
};

const palette = [
  "#1f4d59",
  "#2a6a7b",
  "#2f7a63",
  "#34506b",
  "#3a5a40",
  "#4a2c2a",
  "#4a4e69",
  "#5b4b8a",
];

const buildSvg = ({ title, subtitle, color }) => `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="800" viewBox="0 0 1200 800">
  <rect width="1200" height="800" fill="${color}" />
  <rect x="70" y="70" width="1060" height="660" fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.3)" stroke-width="4" />
  <text x="600" y="380" font-family="Arial, Helvetica, sans-serif" font-size="56" fill="#ffffff" text-anchor="middle">${title}</text>
  <text x="600" y="450" font-family="Arial, Helvetica, sans-serif" font-size="28" fill="#ffffff" text-anchor="middle">${subtitle}</text>
</svg>`;

const svgToDataUri = (svg) => {
  const encoded = Buffer.from(svg).toString("base64");
  return `data:image/svg+xml;base64,${encoded}`;
};

const uploadSvg = async (svg) => {
  const dataUri = svgToDataUri(svg);
  const result = await cloudinary.uploader.upload(dataUri, {
    folder: config.uploadFolder,
    resource_type: "image",
    format: "png",
  });

  return result?.secure_url || result?.url || null;
};

const uploadLocalFile = async (filePath) => {
  const result = await cloudinary.uploader.upload(filePath, {
    folder: config.uploadFolder,
    resource_type: "image",
  });

  return result?.secure_url || result?.url || null;
};

const getRandomCount = (max) => {
  if (max <= 1) return 1;
  return Math.floor(Math.random() * max) + 1;
};

const buildTitles = (id, index) => {
  const title = `Ocorrencia ${id}`;
  const subtitle = `Foto ${index + 1}`;
  return { title, subtitle };
};

async function enrichFotos() {
  ensureCloudinaryEnv();

  const raw = await fs.readFile(config.dataPath, "utf8");
  const ocorrencias = JSON.parse(raw);
  const localFiles = config.localDir
    ? await loadLocalFotos(config.localDir)
    : [];

  if (config.localDir && localFiles.length === 0) {
    throw new Error(`No image files found in ${config.localDir}`);
  }

  if (config.localDir && localFiles.length < ocorrencias.length) {
    console.warn(
      `Only ${localFiles.length} local photos for ${ocorrencias.length} ocorrencias.`,
    );
  }

  let updated = 0;
  let skipped = 0;
  let uploaded = 0;

  for (let i = 0; i < ocorrencias.length; i += 1) {
    const ocorrencia = ocorrencias[i];
    const existing = parseFotoValue(ocorrencia.foto);

    if (!config.forceUpdate && existing.length) {
      skipped += 1;
      continue;
    }

    const ocorrenciaId = ocorrencia.idOcorrencia ?? i + 1;
    const urls = [];

    if (localFiles.length) {
      const filePath = localFiles[i];
      if (!filePath) {
        console.warn(`No local photo for ocorrencia ${ocorrenciaId}.`);
        skipped += 1;
        continue;
      }

      const url = await uploadLocalFile(filePath);
      if (url) {
        urls.push(url);
        uploaded += 1;
      }
    } else {
      const count = getRandomCount(config.maxFotos);

      for (let index = 0; index < count; index += 1) {
        const { title, subtitle } = buildTitles(ocorrenciaId, index);
        const color = palette[(ocorrenciaId + index) % palette.length];
        const svg = buildSvg({ title, subtitle, color });
        const url = await uploadSvg(svg);
        if (url) {
          urls.push(url);
          uploaded += 1;
        }
      }
    }

    if (urls.length) {
      ocorrencia.foto = urls;
    } else {
      ocorrencia.foto = existing.length ? existing : null;
    }

    updated += 1;
    console.log(`Updated ocorrencia ${ocorrenciaId} with ${urls.length} foto(s).`);
  }

  await fs.writeFile(
    config.dataPath,
    JSON.stringify(ocorrencias, null, 2),
    "utf8",
  );

  console.log(
    `Done. Updated: ${updated}, skipped: ${skipped}, uploaded: ${uploaded}.`,
  );
  console.log(`Saved: ${config.dataPath}`);
}

enrichFotos().catch((error) => {
  console.error("Failed to enrich ocorrencias fotos:", error.message);
  process.exit(1);
});
