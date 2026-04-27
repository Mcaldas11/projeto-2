import express from "express";

import {
  createMunicipio,
  deleteMunicipio,
  getAllMunicipios,
  getMunicipioById,
  updateMunicipio,
} from "../controllers/municipios.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllMunicipios)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.municipios), createMunicipio);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getMunicipioById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.municipios),
    updateMunicipio,
  )
  .delete(validateIntegerParam("id"), deleteMunicipio);

export default router;
