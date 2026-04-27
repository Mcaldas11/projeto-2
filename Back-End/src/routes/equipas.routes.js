import express from "express";

import {
  createEquipa,
  deleteEquipa,
  getAllEquipas,
  getEquipaById,
  updateEquipa,
} from "../controllers/equipas.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllEquipas)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.equipas), createEquipa);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getEquipaById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.equipas),
    updateEquipa,
  )
  .delete(validateIntegerParam("id"), deleteEquipa);

export default router;
