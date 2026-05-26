import { Readable } from "stream";
import { Ocorrencia, Cidadao } from "../config/db.config.js";
import { Trabalhador } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.js";
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

export const getAllOcorrencias = async (req, res, next) => {
  try {
    const ocorrencias = await Ocorrencia.findAll();
    const data = ocorrencias.map((ocorrencia) => {
      const fotos = parseFotosField(ocorrencia.foto);
      return { ...ocorrencia.toJSON(), foto: fotos[0] || null, fotos };
    });
    res.json(data);
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

    const fotos = parseFotosField(ocorrencia.foto);
    res.json({ ...ocorrencia.toJSON(), foto: fotos[0] || null, fotos });
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
          // Auto-fill freguesia id from the citizen if not provided
          if (!req.body.idFreguesia && cidadao.fregCidadao) {
            req.body.idFreguesia = cidadao.fregCidadao;
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
      return res.status(403).json({
        message: "Forbidden: only trabalhadores can resolve ocorrencias",
      });
    }

    const trabalhadorId = req.userData.userId;
    const trabalhador = await Trabalhador.findByPk(trabalhadorId);
    if (!trabalhador) {
      return res
        .status(403)
        .json({ message: "Forbidden: trabalhador not found" });
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

    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, `ocorrencias/${id}`)),
    );
    const newFotos = uploads
      .map((result) => result.secure_url || result.url)
      .filter(Boolean);
    const existingFotos = parseFotosField(ocorrencia.foto);
    const fotos = [...existingFotos, ...newFotos];

    await ocorrencia.update({ foto: JSON.stringify(fotos) });

    res.status(201).json({ success: true, fotos });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error adding fotos to ocorrencia"));
  }
};
