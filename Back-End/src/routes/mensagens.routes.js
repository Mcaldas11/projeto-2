import express from "express";

import * as mensagensControllers from "../controllers/mensagens.controller.js";
import authMiddleware from "../middlewares/auth.middleware.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", mensagensControllers.getAllMensagens);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.mensagens),
  mensagensControllers.createMensagem,
);

router.get("/:id", validateIntegerParam("id"), mensagensControllers.getMensagemById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.mensagens),
  authMiddleware,
  mensagensControllers.updateMensagem,
);
router.delete("/:id", authMiddleware, validateIntegerParam("id"), mensagensControllers.deleteMensagem);

export default router;
