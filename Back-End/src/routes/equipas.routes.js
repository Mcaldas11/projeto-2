import express from "express";

import * as equipasControllers from "../controllers/equipas.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", equipasControllers.getAllEquipas);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.equipas),
  equipasControllers.createEquipa,
);

router.get("/:id", validateIntegerParam("id"), equipasControllers.getEquipaById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.equipas),
  equipasControllers.updateEquipa,
);
router.delete("/:id", validateIntegerParam("id"), equipasControllers.deleteEquipa);

export default router;
