import express from "express";
import multer from "multer";

import * as trabalhadoresControllers from "../controllers/trabalhadores.controller.js";
import {
  requireFields,
  requireJsonObject,
  validateIntegerParam,
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
  requireJsonObject,
  requireFields(requiredFieldsByResource.trabalhadores),
  trabalhadoresControllers.createTrabalhador,
);

router.post("/login", trabalhadoresControllers.loginTrabalhador);

router.get("/:id", validateIntegerParam("id"), trabalhadoresControllers.getTrabalhadorById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.trabalhadores),
  trabalhadoresControllers.updateTrabalhador,
);
router.patch(
  "/:id/foto",
  authMiddleware,
  validateIntegerParam("id"),
  uploadFoto.single("file"),
  trabalhadoresControllers.updateTrabalhadorFoto,
);
router.delete("/:id", validateIntegerParam("id"), trabalhadoresControllers.deleteTrabalhador);

export default router;
