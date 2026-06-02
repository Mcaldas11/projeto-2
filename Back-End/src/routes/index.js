import express from "express";

import cidadaosRoutes from "./cidadaos.routes.js";
import equipasRoutes from "./equipas.routes.js";
import mensagensRoutes from "./mensagens.routes.js";
import municipiosRoutes from "./municipios.routes.js";
import ocorrenciasRoutes from "./ocorrencias.routes.js";
import recursosRoutes from "./recursos.routes.js";
import trabalhadoresRoutes from "./trabalhadores.routes.js";
import authRoutes from "./auth.routes.js";

const router = express.Router();

router.use("/auth", authRoutes);
router.use("/cidadaos", cidadaosRoutes);
router.use("/municipios", municipiosRoutes);
router.use("/equipas", equipasRoutes);
router.use("/trabalhadores", trabalhadoresRoutes);
router.use("/recursos", recursosRoutes);
router.use("/ocorrencias", ocorrenciasRoutes);
router.use("/mensagens", mensagensRoutes);

export default router;
