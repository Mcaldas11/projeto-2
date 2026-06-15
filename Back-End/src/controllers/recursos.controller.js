import { Recurso } from "../config/db.config.js";
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

// List all assets Read
export const getAllRecursos = async (req, res, next) => {
  try {
    const recursos = await Recurso.findAll();
    res.json(recursos);
  } catch (error) {
    next(genericError("Error fetching recursos"));
  }
};

// Find asset by ID Read
export const getRecursoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurso = await Recurso.findByPk(id);

    if (!recurso) {
      return next(notFoundError("recurso", id));
    }

    res.json(recurso);
  } catch (error) {
    next(genericError("Error fetching recurso"));
  }
};

// Register new asset Database Update
export const createRecurso = async (req, res, next) => {
  try {
    const recurso = await Recurso.create(req.body);
    res.status(201).json(recurso);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }
    next(genericError("Error creating recurso"));
  }
};

// Edit asset data Database Update
export const updateRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurso = await Recurso.findByPk(id);

    if (!recurso) {
      return next(notFoundError("recurso", id));
    }

    await recurso.update(req.body);
    res.json(recurso);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }
    next(genericError("Error updating recurso"));
  }
};

// Wipe asset data Database Cleanup
export const deleteRecurso = async (req, res, next) => {
  try {
    const { id } = req.params;
    const recurso = await Recurso.findByPk(id);

    if (!recurso) {
      return next(notFoundError("recurso", id));
    }

    await recurso.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting recurso"));
  }
};
