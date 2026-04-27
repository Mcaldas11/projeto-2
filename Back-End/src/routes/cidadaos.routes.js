import express from "express";

import {
  createCidadao,
  deleteCidadao,
  getAllCidadaos,
  getCidadaoById,
  updateCidadao,
} from "../controllers/cidadaos.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllCidadaos)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.cidadaos), createCidadao);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getCidadaoById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.cidadaos),
    updateCidadao,
  )
  .delete(validateIntegerParam("id"), deleteCidadao);

export default router;
