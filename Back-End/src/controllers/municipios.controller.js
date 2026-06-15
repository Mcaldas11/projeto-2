import { Municipio } from "../config/db.config.js";
import {
  genericError,
  notFoundError,
  sequelizeValidationError,
} from "../utils/error.utils.js";

// List parishes Normalization
export const getAllMunicipios = async (req, res, next) => {
  try {
    const municipios = await Municipio.findAll();
    res.json(municipios);
  } catch (error) {
    next(genericError("Error fetching municipios"));
  }
};

// Find parish by ID Read
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
