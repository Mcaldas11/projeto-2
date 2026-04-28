import express from "express";

import * as municipiosControllers from "../controllers/municipios.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", municipiosControllers.getAllMunicipios);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.municipios),
  municipiosControllers.createMunicipio,
);

router.get("/:id", validateIntegerParam("id"), municipiosControllers.getMunicipioById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.municipios),
  municipiosControllers.updateMunicipio,
);
router.delete("/:id", validateIntegerParam("id"), municipiosControllers.deleteMunicipio);

export default router;
