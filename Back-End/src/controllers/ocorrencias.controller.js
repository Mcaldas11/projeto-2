import { Ocorrencia, Cidadao } from "../models/index.js";
import { Trabalhador } from "../models/index.js";
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

    res.json(ocorrencia);
  } catch (error) {
    next(genericError("Error fetching ocorrencia"));
  }
};

export const createOcorrencia = async (req, res, next) => {
  try {
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
