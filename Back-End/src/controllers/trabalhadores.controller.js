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

export const getAllTrabalhadores = async (req, res, next) => {
  try {
    const trabalhadores = await Trabalhador.findAll();
    res.json(trabalhadores);
  } catch (error) {
    next(genericError("Error fetching trabalhadores"));
  }
};

export const getTrabalhadorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    res.json(trabalhador);
  } catch (error) {
    next(genericError("Error fetching trabalhador"));
  }
};

export const createTrabalhador = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.create(req.body);
    res.status(201).json(trabalhador);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating trabalhador"));
  }
};

export const updateTrabalhador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    await trabalhador.update(req.body);
    res.json(trabalhador);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating trabalhador"));
  }
};

export const deleteTrabalhador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    await trabalhador.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting trabalhador"));
  }
};
