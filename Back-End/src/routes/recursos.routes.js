import express from "express";

import {
  createRecurso,
  deleteRecurso,
  getAllRecursos,
  getRecursoById,
  updateRecurso,
} from "../controllers/recursos.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllRecursos)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.recursos), createRecurso);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getRecursoById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.recursos),
    updateRecurso,
  )
  .delete(validateIntegerParam("id"), deleteRecurso);

export default router;
