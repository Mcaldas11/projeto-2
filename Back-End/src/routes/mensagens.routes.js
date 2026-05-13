import express from "express";

import * as mensagensControllers from "../controllers/mensagens.controller.js";
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
  mensagensControllers.updateMensagem,
);
router.delete("/:id", validateIntegerParam("id"), mensagensControllers.deleteMensagem);

export default router;
