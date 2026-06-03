import express from "express";
import multer from "multer";

import * as cidadaosControllers from "../controllers/cidadaos.controller.js";
import * as ocorrenciasControllers from "../controllers/ocorrencias.controller.js";
import {
  requireFields,
  requireJsonObject,
  validateIntegerParam,
  validatePassword,
} from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

const uploadFoto = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    const allowed = ["image/jpeg", "image/png", "image/gif", "image/webp"];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Apenas JPG, PNG, GIF ou WEBP sao permitidos"));
    }
  },
});

router.get("/", cidadaosControllers.getAllCidadaos);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.cidadaos),
  validatePassword,
  cidadaosControllers.createCidadao,
);

router.post("/login", cidadaosControllers.loginCidadao);
router.get("/me", authMiddleware, cidadaosControllers.getCidadaoMe);
router.put("/me", authMiddleware, requireJsonObject, cidadaosControllers.updateCidadaoMe);

// Create an occurrence for the authenticated cidadao (uses token userId)
router.get(
  "/me/ocorrencias",
  authMiddleware,
  ocorrenciasControllers.getOcorrenciasForCidadao,
);
router.post(
  "/me/ocorrencias",
  authMiddleware,
  requireJsonObject,
  requireFields(
    requiredFieldsByResource.ocorrencias.filter(
      (f) =>
        f !== "idCidadao" &&
        f !== "nomeAutor" &&
        f !== "nrTelemovelAutor" &&
        f !== "idFreguesia" &&
        f !== "estado",
    ),
  ),
  ocorrenciasControllers.createOcorrenciaForCidadao,
);

router.get(
  "/:id",
  validateIntegerParam("id"),
  cidadaosControllers.getCidadaoById,
);
router.put(
  "/:id",
  authMiddleware,
  validateIntegerParam("id"),
  requireJsonObject,
  cidadaosControllers.updateCidadao,
);
router.patch(
  "/:id/foto",
  authMiddleware,
  validateIntegerParam("id"),
  uploadFoto.single("file"),
  cidadaosControllers.updateCidadaoFoto,
);
router.delete(
  "/:id",
  authMiddleware,
  validateIntegerParam("id"),
  cidadaosControllers.deleteCidadao,
);

export default router;
