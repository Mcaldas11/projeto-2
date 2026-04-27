import express from "express";

import {
  createOcorrencia,
  deleteOcorrencia,
  getAllOcorrencias,
  getOcorrenciaById,
  updateOcorrencia,
} from "../controllers/ocorrencias.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllOcorrencias)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.ocorrencias), createOcorrencia);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getOcorrenciaById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.ocorrencias),
    updateOcorrencia,
  )
  .delete(validateIntegerParam("id"), deleteOcorrencia);

export default router;
