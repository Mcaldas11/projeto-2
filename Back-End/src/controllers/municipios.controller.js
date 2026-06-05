import { Municipio } from "../config/db.config.js";
import {
  genericError,
  notFoundError,
  sequelizeValidationError,
} from "../utils/error.utils.js";

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
