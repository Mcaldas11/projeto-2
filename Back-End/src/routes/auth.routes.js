import express from "express";
import * as authController from "../controllers/auth.controller.js";
import { requireJsonObject } from "../middlewares/validation.middleware.js";

const router = express.Router();

router.post("/login", requireJsonObject, authController.unifiedLogin);

export default router;
