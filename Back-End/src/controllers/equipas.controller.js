import { Equipa } from "../models/index.js";
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

export const getAllEquipas = async (req, res, next) => {
  try {
    const equipas = await Equipa.findAll();
    res.json(equipas);
  } catch (error) {
    next(genericError("Error fetching equipas"));
  }
};

export const getEquipaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const equipa = await Equipa.findByPk(id);

    if (!equipa) {
      return next(notFoundError("equipa", id));
    }

    res.json(equipa);
  } catch (error) {
    next(genericError("Error fetching equipa"));
  }
};

export const createEquipa = async (req, res, next) => {
  try {
    const equipa = await Equipa.create(req.body);
    res.status(201).json(equipa);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating equipa"));
  }
};

export const updateEquipa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const equipa = await Equipa.findByPk(id);

    if (!equipa) {
      return next(notFoundError("equipa", id));
    }

    await equipa.update(req.body);
    res.json(equipa);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating equipa"));
  }
};

export const deleteEquipa = async (req, res, next) => {
  try {
    const { id } = req.params;
    const equipa = await Equipa.findByPk(id);

    if (!equipa) {
      return next(notFoundError("equipa", id));
    }

    await equipa.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting equipa"));
  }
};
