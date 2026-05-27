import express from "express";
import multer from "multer";

import * as ocorrenciasControllers from "../controllers/ocorrencias.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";
import authMiddleware from "../middlewares/auth.middleware.js";

const router = express.Router();

const uploadFotos = multer({
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

// Apply auth middleware to all occurrence routes
router.use(authMiddleware);

router.get("/", ocorrenciasControllers.getAllOcorrencias);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.ocorrencias.filter((f) => f !== "estado")),
  ocorrenciasControllers.createOcorrencia,
);

router.get("/:id", validateIntegerParam("id"), ocorrenciasControllers.getOcorrenciaById);
router.post(
  "/:id/fotos",
  validateIntegerParam("id"),
  uploadFotos.array("files", 10),
  ocorrenciasControllers.addOcorrenciaFotos,
);
router.delete(
  "/:id/fotos",
  validateIntegerParam("id"),
  ocorrenciasControllers.deleteOcorrenciaFotos,
);
router.delete(
  "/:id/fotos/:fotoIndex",
  validateIntegerParam("id"),
  ocorrenciasControllers.deleteOcorrenciaFotoByIndex,
);
router.patch(
  "/:id/fotos/:fotoIndex",
  validateIntegerParam("id"),
  uploadFotos.array("files", 1),
  ocorrenciasControllers.replaceOcorrenciaFoto,
);
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
