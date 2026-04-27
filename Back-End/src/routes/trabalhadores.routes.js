import express from "express";

import {
  createTrabalhador,
  deleteTrabalhador,
  getAllTrabalhadores,
  getTrabalhadorById,
  updateTrabalhador,
} from "../controllers/trabalhadores.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllTrabalhadores)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.trabalhadores), createTrabalhador);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getTrabalhadorById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.trabalhadores),
    updateTrabalhador,
  )
  .delete(validateIntegerParam("id"), deleteTrabalhador);

export default router;
