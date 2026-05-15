import express from "express";

import * as ocorrenciasControllers from "../controllers/ocorrencias.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

// Apply auth middleware to all occurrence routes
router.use(authMiddleware);

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
// Equipa resolution endpoint: only trabalhadores can call
router.patch(
  "/:id/resolve",
  validateIntegerParam("id"),
  requireJsonObject,
  ocorrenciasControllers.resolveOcorrenciaByEquipa,
);
router.delete("/:id", validateIntegerParam("id"), ocorrenciasControllers.deleteOcorrencia);

export default router;
