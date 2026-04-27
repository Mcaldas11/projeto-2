import express from "express";

import {
  createMensagem,
  deleteMensagem,
  getAllMensagens,
  getMensagemById,
  updateMensagem,
} from "../controllers/mensagens.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router
  .route("/")
  .get(getAllMensagens)
  .post(requireJsonObject, requireFields(requiredFieldsByResource.mensagens), createMensagem);

router
  .route("/:id")
  .get(validateIntegerParam("id"), getMensagemById)
  .put(
    validateIntegerParam("id"),
    requireJsonObject,
    requireFields(requiredFieldsByResource.mensagens),
    updateMensagem,
  )
  .delete(validateIntegerParam("id"), deleteMensagem);

export default router;
