import { Ocorrencia } from "../models/index.js";
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
