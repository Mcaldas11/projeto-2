import fs from "fs/promises";
import path from "path";
import { fileURLToPath } from "url";
import { Ocorrencia, Cidadao } from "../config/db.config.js";
import { Trabalhador } from "../config/db.config.js";
import {
  genericError,
  notFoundError,
  sequelizeValidationError,
} from "../utils/error.utils.js";

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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ocorrenciasUploadsDir = path.join(__dirname, "..", "..", "uploads", "ocorrencias");

const listOcorrenciaFotos = async (id) => {
  const dir = path.join(ocorrenciasUploadsDir, String(id));
  try {
    const files = await fs.readdir(dir);
    return files.sort().map((name) => `/uploads/ocorrencias/${id}/${name}`);
  } catch (error) {
    if (error?.code === "ENOENT") return [];
    throw error;
  }
};

const DEFAULT_ESTADO = "À espera de equipa";

export const getAllOcorrencias = async (req, res, next) => {
  try {
    const ocorrencias = await Ocorrencia.findAll();
    res.json(ocorrencias);
  } catch (error) {
    next(genericError("Error fetching ocorrencias"));
  }
};

export const getOcorrenciaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const fotos = await listOcorrenciaFotos(id);
    res.json({ ...ocorrencia.toJSON(), fotos });
  } catch (error) {
    next(genericError("Error fetching ocorrencia"));
  }
};

export const createOcorrencia = async (req, res, next) => {
  try {
    req.body.estado = DEFAULT_ESTADO;
    const ocorrencia = await Ocorrencia.create(req.body);
    res.status(201).json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating ocorrencia"));
  }
};

export const createOcorrenciaForCidadao = async (req, res, next) => {
  try {
    req.body.estado = DEFAULT_ESTADO;
    // Ensure the idCidadao comes from the authenticated token, not the client
    if (req.userData && req.userData.userId) {
      const userId = req.userData.userId;
      req.body.idCidadao = userId;

      // Populate author name and phone from the authenticated cidadao record
      try {
        const cidadao = await Cidadao.findByPk(userId);
        if (cidadao) {
          req.body.nomeAutor = cidadao.nome;
          req.body.nrTelemovelAutor = cidadao.nrTelemovel;
          // Auto-fill municipality id from the citizen if not provided
          if (!req.body.idMunicipio && cidadao.munCidadao) {
            req.body.idMunicipio = cidadao.munCidadao;
          }
        }
      } catch (err) {
        // ignore and continue; validation/creation will surface issues
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

export const updateOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    await ocorrencia.update(req.body);
    res.json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating ocorrencia"));
  }
};

export const deleteOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    await ocorrencia.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting ocorrencia"));
  }
};

export const resolveOcorrenciaByEquipa = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only trabalhadores can resolve occurrences
    if (!req.userData || req.userData.userType !== "trabalhador") {
      return res.status(403).json({ message: "Forbidden: only trabalhadores can resolve ocorrencias" });
    }

    const trabalhadorId = req.userData.userId;
    const trabalhador = await Trabalhador.findByPk(trabalhadorId);
    if (!trabalhador) {
      return res.status(403).json({ message: "Forbidden: trabalhador not found" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    // Determine allowed fields to update by equipa
    const { dataAgendada, feedback, dataResolucao, estado } = req.body;

    const updates = {};
    if (dataAgendada !== undefined) updates.dataAgendada = dataAgendada;
    if (feedback !== undefined) updates.feedback = feedback;
    if (dataResolucao !== undefined) updates.dataResolucao = dataResolucao;
    if (estado !== undefined) updates.estado = estado;

    // Assign equipa if not already set
    if (!ocorrencia.idEquipa && trabalhador.idEquipa) {
      updates.idEquipa = trabalhador.idEquipa;
    }

    await ocorrencia.update(updates);
    res.json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error resolving ocorrencia"));
  }
};

export const addOcorrenciaFotos = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Falta o ficheiro" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const fotos = req.files.map((file) => `/uploads/ocorrencias/${id}/${file.filename}`);

    if (!ocorrencia.foto && fotos.length) {
      await ocorrencia.update({ foto: fotos[0] });
    }

    res.status(201).json({ success: true, fotos });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error adding fotos to ocorrencia"));
  }
};
