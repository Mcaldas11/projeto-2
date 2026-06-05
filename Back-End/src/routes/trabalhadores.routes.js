import express from "express";
import multer from "multer";

import * as ocorrenciasControllers from "../controllers/ocorrencias.controller.js";
import * as trabalhadoresControllers from "../controllers/trabalhadores.controller.js";
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

router.get("/", trabalhadoresControllers.getAllTrabalhadores);
router.post(
  "/",
  authMiddleware,
  requireJsonObject,
  requireFields(requiredFieldsByResource.trabalhadores),
  validatePassword,
  trabalhadoresControllers.createTrabalhador,
);

router.post("/login", trabalhadoresControllers.loginTrabalhador);
router.get("/me", authMiddleware, trabalhadoresControllers.getTrabalhadorMe);
router.put(
  "/me",
  authMiddleware,
  requireJsonObject,
  trabalhadoresControllers.updateTrabalhadorMe,
);
router.get(
  "/me/ocorrencias",
  authMiddleware,
  ocorrenciasControllers.getOcorrenciasPendentesForTrabalhador,
);
router.get(
  "/me/freguesia/ocorrencias",
  authMiddleware,
  ocorrenciasControllers.getOcorrenciasFreguesiaForTrabalhador,
);
router.get(
  "/me/ocorrencias/resolvidas",
  authMiddleware,
  ocorrenciasControllers.getOcorrenciasResolvidasForTrabalhador,
);
router.get(
  "/me/ocorrencias/em-resolucao",
  authMiddleware,
  ocorrenciasControllers.getOcorrenciasEmResolucaoForTrabalhador,
);
router.get(
  "/me/ocorrencias/pendentes",
  authMiddleware,
  ocorrenciasControllers.getOcorrenciasHomeForTrabalhador,
);

router.get(
  "/:id",
  validateIntegerParam("id"),
  trabalhadoresControllers.getTrabalhadorById,
);
router.put(
  "/:id",
  authMiddleware,
  validateIntegerParam("id"),
  requireJsonObject,
  trabalhadoresControllers.updateTrabalhador,
);
router.patch(
  "/:id/foto",
  authMiddleware,
  validateIntegerParam("id"),
  uploadFoto.single("file"),
  trabalhadoresControllers.updateTrabalhadorFoto,
);
router.delete(
  "/:id",
  authMiddleware,
  validateIntegerParam("id"),
  trabalhadoresControllers.deleteTrabalhador,
);

export default router;
