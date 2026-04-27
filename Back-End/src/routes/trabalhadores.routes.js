import express from "express";

import * as trabalhadoresControllers from "../controllers/trabalhadores.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", trabalhadoresControllers.getAllTrabalhadores);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.trabalhadores),
  trabalhadoresControllers.createTrabalhador,
);

router.get("/:id", validateIntegerParam("id"), trabalhadoresControllers.getTrabalhadorById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.trabalhadores),
  trabalhadoresControllers.updateTrabalhador,
);
router.delete("/:id", validateIntegerParam("id"), trabalhadoresControllers.deleteTrabalhador);

export default router;
