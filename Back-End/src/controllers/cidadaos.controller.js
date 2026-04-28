import { Cidadao } from "../models/index.js";
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

export const getAllCidadaos = async (req, res, next) => {
  try {
    const cidadaos = await Cidadao.findAll();
    res.json(cidadaos);
  } catch (error) {
    next(genericError("Error fetching cidadaos"));
  }
};

export const getCidadaoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cidadao = await Cidadao.findByPk(id);

    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    res.json(cidadao);
  } catch (error) {
    next(genericError("Error fetching cidadao"));
  }
};

export const createCidadao = async (req, res, next) => {
  try {
    const cidadao = await Cidadao.create(req.body);
    res.status(201).json(cidadao);
  } catch (error) {
    console.error("DEBUG:", error);
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating cidadao"));
  }
};

export const updateCidadao = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cidadao = await Cidadao.findByPk(id);

    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    await cidadao.update(req.body);
    res.json(cidadao);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating cidadao"));
  }
};

export const deleteCidadao = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cidadao = await Cidadao.findByPk(id);

    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    await cidadao.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting cidadao"));
  }
};
