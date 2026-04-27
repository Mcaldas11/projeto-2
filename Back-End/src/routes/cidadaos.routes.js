import express from "express";

import * as cidadaosControllers from "../controllers/cidadaos.controller.js";
import { requireFields, requireJsonObject, validateIntegerParam } from "../middlewares.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", cidadaosControllers.getAllCidadaos);
router.post(
  "/",
  requireJsonObject,
  requireFields(requiredFieldsByResource.cidadaos),
  cidadaosControllers.createCidadao,
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
