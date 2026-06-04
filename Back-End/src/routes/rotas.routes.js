import express from "express";
import * as rotasControllers from "../controllers/rotas.controller.js";
import { validateIntegerParam } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.get("/", rotasControllers.getAllRotas);
router.get("/:id", validateIntegerParam("id"), rotasControllers.getRotaById);
router.post("/", rotasControllers.createRota);
router.patch("/:id", validateIntegerParam("id"), rotasControllers.updateRota);
router.delete("/:id", validateIntegerParam("id"), rotasControllers.deleteRota);

export default router;
