import express from "express";

import * as cidadaosControllers from "../controllers/cidadaos.controller.js";
import * as ocorrenciasControllers from "../controllers/ocorrencias.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

router.get("/", cidadaosControllers.getAllCidadaos);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.cidadaos),
  cidadaosControllers.createCidadao,
);

router.post("/login", cidadaosControllers.loginCidadao);

// Create an occurrence for the authenticated cidadao (uses token userId)
router.post(
  "/me/ocorrencias",
  authMiddleware,
  requireJsonObject,
  requireFields(
    requiredFieldsByResource.ocorrencias.filter(
      (f) => f !== "idCidadao" && f !== "nomeAutor" && f !== "nrTelemovelAutor",
    ),
  ),
  ocorrenciasControllers.createOcorrenciaForCidadao,
);

router.get("/:id", validateIntegerParam("id"), cidadaosControllers.getCidadaoById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.cidadaos),
  cidadaosControllers.updateCidadao,
);
router.delete("/:id", validateIntegerParam("id"), cidadaosControllers.deleteCidadao);

export default router;
