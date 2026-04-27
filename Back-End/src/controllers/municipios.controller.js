import { Municipio } from "../models/index.js";
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

export const getAllMunicipios = async (req, res, next) => {
  try {
    const municipios = await Municipio.findAll();
    res.json(municipios);
  } catch (error) {
    next(genericError("Error fetching municipios"));
  }
};

export const getMunicipioById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const municipio = await Municipio.findByPk(id);

    if (!municipio) {
      return next(notFoundError("municipio", id));
    }

    res.json(municipio);
  } catch (error) {
    next(genericError("Error fetching municipio"));
  }
};

export const createMunicipio = async (req, res, next) => {
  try {
    const municipio = await Municipio.create(req.body);
    res.status(201).json(municipio);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating municipio"));
  }
};

export const updateMunicipio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const municipio = await Municipio.findByPk(id);

    if (!municipio) {
      return next(notFoundError("municipio", id));
    }

    await municipio.update(req.body);
    res.json(municipio);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating municipio"));
  }
};

export const deleteMunicipio = async (req, res, next) => {
  try {
    const { id } = req.params;
    const municipio = await Municipio.findByPk(id);

    if (!municipio) {
      return next(notFoundError("municipio", id));
    }

    await municipio.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting municipio"));
  }
};
