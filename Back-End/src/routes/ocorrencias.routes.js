import express from "express";

import * as ocorrenciasControllers from "../controllers/ocorrencias.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", ocorrenciasControllers.getAllOcorrencias);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.ocorrencias),
  ocorrenciasControllers.createOcorrencia,
);

router.get("/:id", validateIntegerParam("id"), ocorrenciasControllers.getOcorrenciaById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.ocorrencias),
  ocorrenciasControllers.updateOcorrencia,
);
router.delete("/:id", validateIntegerParam("id"), ocorrenciasControllers.deleteOcorrencia);

export default router;
