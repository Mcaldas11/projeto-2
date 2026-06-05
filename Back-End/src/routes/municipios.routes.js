import express from "express";

import * as municipiosControllers from "../controllers/municipios.controller.js";
import {
  requireFields,
  requireJsonObject,
  validateIntegerParam,
} from "../middlewares/validation.middleware.js";
import { requiredFieldsByResource } from "../utils/required-fields.utils.js";

const router = express.Router();

router.get("/", municipiosControllers.getAllMunicipios);

router.get(
  "/:id",
  validateIntegerParam("id"),
  municipiosControllers.getMunicipioById,
);

export default router;
