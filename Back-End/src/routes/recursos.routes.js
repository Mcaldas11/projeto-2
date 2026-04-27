import express from "express";

import * as recursosControllers from "../controllers/recursos.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", recursosControllers.getAllRecursos);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.recursos),
  recursosControllers.createRecurso,
);

router.get("/:id", validateIntegerParam("id"), recursosControllers.getRecursoById);
router.put(
  "/:id",
  validateIntegerParam("id"),
  requireJsonObject,
  requireFields(requiredFieldsByResource.recursos),
  recursosControllers.updateRecurso,
);
router.delete("/:id", validateIntegerParam("id"), recursosControllers.deleteRecurso);

export default router;
