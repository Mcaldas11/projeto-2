import { Readable } from "stream";
import { Ocorrencia, Cidadao, Trabalhador, Mensagem } from "../config/db.config.js";
import { Op } from "sequelize";
import cloudinary from "../config/cloudinary.js";
import {
  genericError,
  notFoundError,
  sequelizeValidationError,
} from "../utils/error.utils.js";

// Handle DB errors Validation
const handleSequelizeValidation = (error, next) => {
  if (
    error?.name === "SequelizeValidationError" ||
    error?.name === "SequelizeUniqueConstraintError"
  ) {
    next(sequelizeValidationError(error.errors || []));
    return true;
  }
  return false;
};

// Parse photo string Deserialization
const parseFotosField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
};

// Normalize photo entry DTO
const normalizeFotoEntry = (entry) => {
  if (typeof entry === "string") return { url: entry, publicId: null };
  if (!entry || typeof entry !== "object") return { url: null, publicId: null };

  const url = entry.url || entry.secure_url || null;
  const publicId = entry.public_id || entry.publicId || null;

  return { url, publicId };
};

// Clean photo field Normalization
const normalizeFotosField = (value) =>
  parseFotosField(value)
    .map(normalizeFotoEntry)
    .filter((foto) => foto.url);

// Map photo indices DTO
const buildFotosComIndice = (urls) =>
  urls.map((url, index) => ({ index, url }));

// Resolve image key Cloudinary Utility
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  const cleanUrl = url.split("?")[0];
  const marker = "/upload/";
  const markerIndex = cleanUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  let publicPath = cleanUrl.slice(markerIndex + marker.length);
  publicPath = publicPath.replace(/^v\d+\//, "");

  const lastDot = publicPath.lastIndexOf(".");
  if (lastDot > -1) {
    publicPath = publicPath.slice(0, lastDot);
  }

  return publicPath || null;
};

// Upload file stream Cloudinary Utility
const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });

const DEFAULT_ESTADO = "À espera da equipa";

// Detect worker account Authorization
const normalizeWorkerType = (userType) =>
  typeof userType === "string" && userType.startsWith("trabalhador");

// Map output data DTO
const mapOcorrenciasWithFotos = (ocorrencias) =>
  ocorrencias.map((ocorrencia) => {
    const fotos = normalizeFotosField(ocorrencia.foto).map((foto) => foto.url);
    const userImg = ocorrencia.cidadao?.fotoPerfil || null;
    return {
      ...ocorrencia.toJSON(),
      foto: buildFotosComIndice(fotos),
      userImg,
    };
  });

// Fetch all reports Read
export const getAllOcorrencias = async (req, res, next) => {
  try {
    const ocorrencias = await Ocorrencia.findAll({
      include: [
        {
          model: Cidadao,
          as: "cidadao",
          attributes: ["fotoPerfil"],
        },
      ],
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching ocorrencias"));
  }
};

// Find report by ID Read
export const getOcorrenciaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id, {
      include: [
        {
          model: Cidadao,
          as: "cidadao",
          attributes: ["fotoPerfil"],
        },
      ],
    });

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    res.json(mapOcorrenciasWithFotos([ocorrencia])[0]);
  } catch (error) {
    next(genericError("Error fetching ocorrencia"));
  }
};

// Report issue from token Authentication
export const createOcorrenciaForCidadao = async (req, res, next) => {
  try {
    req.body.estado = DEFAULT_ESTADO;

    if (req.userData && req.userData.userId) {
      const userId = req.userData.userId;
      req.body.idCidadao = userId;

      // Fetch reporter info Database Query
      try {
        const cidadao = await Cidadao.findByPk(userId);
        if (cidadao) {
          req.body.nomeAutor = cidadao.nome;
          req.body.nrTelemovelAutor = cidadao.nrTelemovel;
          if (!req.body.idFreguesia && cidadao.fregCidadao) {
            req.body.idFreguesia = cidadao.fregCidadao;
          }
        }
      } catch (err) {
        // ignore and continue
      }
    }

    const ocorrencia = await Ocorrencia.create(req.body);
    res.status(201).json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating ocorrencia"));
  }
};

// Get occurrences for the authenticated citizen Read
export const getOcorrenciasForCidadao = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const ocorrencias = await Ocorrencia.findAll({
      where: { idCidadao: userId },
      include: [
        {
          model: Cidadao,
          as: "cidadao",
          attributes: ["fotoPerfil"],
        },
      ],
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching ocorrencias for cidadao"));
  }
};

// Get occurrences for the parish of the authenticated citizen Read
export const getOcorrenciasFreguesiaForCidadao = async (req, res, next) => {
  try {
    const userId = req.userData.userId;
    const cidadao = await Cidadao.findByPk(userId);
    if (!cidadao || !cidadao.fregCidadao) {
      return res.status(404).json({ message: "Parish not found for citizen" });
    }

    const ocorrencias = await Ocorrencia.findAll({
      where: { idFreguesia: cidadao.fregCidadao },
      include: [
        {
          model: Cidadao,
          as: "cidadao",
          attributes: ["fotoPerfil"],
        },
      ],
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching ocorrencias for parish"));
  }
};

// Get pending occurrences for worker's team Read
export const getOcorrenciasPendentesForTrabalhador = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador || !trabalhador.idEquipa) {
      return res.status(403).json({ message: "Worker without team" });
    }

    const ocorrencias = await Ocorrencia.findAll({
      where: {
        idEquipa: trabalhador.idEquipa,
        estado: "À espera da equipa",
      },
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching pending ocorrencias"));
  }
};

// Get occurrences for worker's parish Read
export const getOcorrenciasFreguesiaForTrabalhador = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador || !trabalhador.idFreguesia) {
      return res.status(403).json({ message: "Worker without parish" });
    }

    const ocorrencias = await Ocorrencia.findAll({
      where: { idFreguesia: trabalhador.idFreguesia },
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching parish ocorrencias"));
  }
};

// Get resolved occurrences for worker's team Read
export const getOcorrenciasResolvidasForTrabalhador = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador || !trabalhador.idEquipa) {
      return res.status(403).json({ message: "Worker without team" });
    }

    const ocorrencias = await Ocorrencia.findAll({
      where: {
        idEquipa: trabalhador.idEquipa,
        estado: "Resolvido",
      },
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching resolved ocorrencias"));
  }
};

// Get in-progress occurrences for worker's team Read
export const getOcorrenciasEmResolucaoForTrabalhador = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador || !trabalhador.idEquipa) {
      return res.status(403).json({ message: "Worker without team" });
    }

    const ocorrencias = await Ocorrencia.findAll({
      where: {
        idEquipa: trabalhador.idEquipa,
        estado: "Em resolução",
      },
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching in-progress ocorrencias"));
  }
};

// Get summary occurrences for worker home Read
export const getOcorrenciasHomeForTrabalhador = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador || !trabalhador.idEquipa) {
      return res.status(403).json({ message: "Worker without team" });
    }

    const ocorrencias = await Ocorrencia.findAll({
      where: {
        idEquipa: trabalhador.idEquipa,
        estado: { [Op.ne]: "Resolvido" },
      },
      limit: 10,
      order: [["createdAt", "DESC"]],
    });
    res.json(mapOcorrenciasWithFotos(ocorrencias));
  } catch (error) {
    next(genericError("Error fetching home ocorrencias"));
  }
};

// General create occurrence Create
export const createOcorrencia = async (req, res, next) => {
  try {
    const ocorrencia = await Ocorrencia.create(req.body);
    res.status(201).json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error creating ocorrencia"));
  }
};

// Update occurrence Update
export const updateOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) return next(notFoundError("ocorrencia", id));

    await ocorrencia.update(req.body);
    res.json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error updating ocorrencia"));
  }
};

// Delete occurrence Cascading Cleanup
export const deleteOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) return next(notFoundError("ocorrencia", id));

    const fotos = normalizeFotosField(ocorrencia.foto);
    for (const foto of fotos) {
      if (foto.publicId) {
        await cloudinary.uploader.destroy(foto.publicId).catch(() => {});
      }
    }

    await ocorrencia.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting ocorrencia"));
  }
};

// Wipe all photos Cloudinary Utility
export const deleteOcorrenciaFotos = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) return next(notFoundError("ocorrencia", id));

    const fotos = normalizeFotosField(ocorrencia.foto);
    for (const foto of fotos) {
      if (foto.publicId) {
        await cloudinary.uploader.destroy(foto.publicId).catch(() => {});
      }
    }

    await ocorrencia.update({ foto: null });
    res.json({ success: true, message: "All photos deleted" });
  } catch (error) {
    next(genericError("Error deleting fotos"));
  }
};

// Delete photo by index Normalization
export const deleteOcorrenciaFotoByIndex = async (req, res, next) => {
  try {
    const { id, fotoIndex } = req.params;
    const index = parseInt(fotoIndex, 10);

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) return next(notFoundError("ocorrencia", id));

    let fotos = normalizeFotosField(ocorrencia.foto);
    if (index < 0 || index >= fotos.length) {
      return res.status(400).json({ message: "Invalid photo index" });
    }

    const target = fotos[index];
    if (target.publicId) {
      await cloudinary.uploader.destroy(target.publicId).catch(() => {});
    }

    fotos.splice(index, 1);
    const urls = fotos.map((f) => f.url);
    await ocorrencia.update({ foto: urls.length ? JSON.stringify(urls) : null });

    res.json({ success: true, foto: buildFotosComIndice(urls) });
  } catch (error) {
    next(genericError("Error deleting foto"));
  }
};

// Replace photo at index Cloudinary Utility
export const replaceOcorrenciaFoto = async (req, res, next) => {
  try {
    const { id, fotoIndex } = req.params;
    const index = parseInt(fotoIndex, 10);

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Missing file" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) return next(notFoundError("ocorrencia", id));

    let fotos = normalizeFotosField(ocorrencia.foto);
    if (index < 0 || index >= fotos.length) {
      return res.status(400).json({ message: "Invalid photo index" });
    }

    const upload = await uploadToCloudinary(req.files[0], `ocorrencias/${id}`);
    const newUrl = upload.secure_url || upload.url;
    const newPublicId = upload.public_id;

    const oldTarget = fotos[index];
    if (oldTarget.publicId) {
      await cloudinary.uploader.destroy(oldTarget.publicId).catch(() => {});
    }

    fotos[index] = { url: newUrl, publicId: newPublicId };
    const urls = fotos.map((f) => f.url);
    await ocorrencia.update({ foto: JSON.stringify(urls) });

    res.json({ success: true, foto: buildFotosComIndice(urls) });
  } catch (error) {
    next(genericError("Error replacing foto"));
  }
};

// Handle report resolution Authorization
export const resolveOcorrenciaByEquipa = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.userData || !normalizeWorkerType(req.userData.userType)) {
      return res.status(403).json({
        message: "Forbidden: only trabalhadores can resolve ocorrencias",
      });
    }

    const trabalhadorId = req.userData.userId;
    const trabalhador = await Trabalhador.findByPk(trabalhadorId);
    if (!trabalhador || !trabalhador.idEquipa) {
      return res.status(403).json({ message: "Forbidden: worker without team" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    // Check team ownership Authorization
    if (
      ocorrencia.idEquipa &&
      Number(ocorrencia.idEquipa) !== Number(trabalhador.idEquipa)
    ) {
      return res.status(403).json({
        message: "Forbidden: occurrence assigned to another team",
      });
    }

    const { dataAgendada, feedback, dataResolucao, estado } = req.body;

    const updates = {};
    if (dataAgendada !== undefined) updates.dataAgendada = dataAgendada;
    if (feedback !== undefined) updates.feedback = feedback;
    if (dataResolucao !== undefined) updates.dataResolucao = dataResolucao;
    updates.estado = typeof estado === "string" && estado.trim() ? estado.trim() : "Em resolução";

    // Set auto timestamp Business Logic
    if (updates.estado === "Resolvido" && updates.dataResolucao == null) {
      updates.dataResolucao = new Date();
    }

    // Link team Database Update
    if (!ocorrencia.idEquipa) {
      updates.idEquipa = trabalhador.idEquipa;
    }

    await ocorrencia.update(updates);
    res.json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error resolving ocorrencia"));
  }
};

// Add new photos Cascading Cleanup
export const addOcorrenciaFotos = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Missing files" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    // Parallel upload Cloudinary Utility
    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, `ocorrencias/${id}`)),
    );
    const newFotos = uploads
      .map((result) => result.secure_url || result.url)
      .filter(Boolean);
    const existingFotos = normalizeFotosField(ocorrencia.foto).map(
      (foto) => foto.url,
    );
    const fotos = [...existingFotos, ...newFotos];

    // Store as JSON Serialization
    await ocorrencia.update({ foto: JSON.stringify(fotos) });

    res.status(201).json({
      success: true,
      foto: buildFotosComIndice(fotos),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error adding fotos to ocorrencia"));
  }
};
