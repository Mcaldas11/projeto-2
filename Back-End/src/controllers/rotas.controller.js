import { Rota, Trabalhador } from "../config/db.config.js";
import {
  genericError,
  notFoundError,
  sequelizeValidationError,
} from "../utils/error.utils.js";

// Handle DB errors Validation
const handleSequelizeValidation = (error, next) => {
  if (
    error?.name === "SequelizeValidationError" ||
    error?.name === "SequelizeUniqueConstraintError"
  ) {
    next(sequelizeValidationError(error.errors || []));
    return true;
  }
  return false;
};

// Get admin list Configuration
const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "admin@vcc.pt,admin.geral@example.pt,admin_e2e_test@vcc.pt")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

// Validate admin status Authorization
const isAdminEmail = (email) => getAdminEmails().includes((email || "").trim());

// Check admin role Authorization
const isRequesterAdmin = async (req) => {
  if (!req.userData || !req.userData.userType) return false;
  if (req.userData.userType === "trabalhador_admin") return true;
  if (!req.userData.userType.startsWith("trabalhador")) return false;
  const requesterTrab = await Trabalhador.findByPk(req.userData.userId);
  return Boolean(requesterTrab && isAdminEmail(requesterTrab.emailTrabalhador));
};

// List paths and coords Deserialization
export const getAllRotas = async (req, res, next) => {
  try {
    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";
    
    let filter = {};
    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (requester) {
        filter = { idFreguesia: requester.idFreguesia };
      }
    }

    const rotas = await Rota.findAll({ where: filter });
    const data = rotas.map((r) => ({
      ...r.toJSON(),
      waypoints: JSON.parse(r.waypoints || "[]"),
      geometry: JSON.parse(r.geometry || "[]"),
    }));
    res.json(data);
  } catch (error) {
    next(genericError("Error fetching rotas"));
  }
};

// Find path by ID Deserialization
export const getRotaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rota = await Rota.findByPk(id);
    if (!rota) return next(notFoundError("rota", id));

    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";

    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (requester && Number(rota.idFreguesia) !== Number(requester.idFreguesia)) {
        return res.status(403).json({ message: "Forbidden: Not your parish route" });
      }
    }

    res.json({
      ...rota.toJSON(),
      waypoints: JSON.parse(rota.waypoints || "[]"),
      geometry: JSON.parse(rota.geometry || "[]"),
    });
  } catch (error) {
    next(genericError("Error fetching rota"));
  }
};

// Store path and coords Serialization
export const createRota = async (req, res, next) => {
  try {
    const { nome, idFreguesia, waypoints, geometry, cor } = req.body;
    
    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";
    
    let targetIdFreguesia = idFreguesia;

    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (!requester) return res.status(403).json({ message: "Requester not found" });
      targetIdFreguesia = requester.idFreguesia;
    }

    if (!targetIdFreguesia) {
      return res.status(400).json({ message: "idFreguesia is required" });
    }

    const rota = await Rota.create({
      nome,
      idFreguesia: targetIdFreguesia,
      waypoints: JSON.stringify(waypoints || []),
      geometry: JSON.stringify(geometry || []),
      cor,
    });
    res.status(201).json({
      ...rota.toJSON(),
      waypoints: JSON.parse(rota.waypoints),
      geometry: JSON.parse(rota.geometry),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error creating rota"));
  }
};

// Edit path and coords Serialization
export const updateRota = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rota = await Rota.findByPk(id);
    if (!rota) return next(notFoundError("rota", id));

    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";

    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (requester && Number(rota.idFreguesia) !== Number(requester.idFreguesia)) {
        return res.status(403).json({ message: "Forbidden: Cannot update other parish route" });
      }
    }

    const updates = { ...req.body };
    if (!isAdmin) delete updates.idFreguesia;

    if (updates.waypoints) updates.waypoints = JSON.stringify(updates.waypoints);
    if (updates.geometry) updates.geometry = JSON.stringify(updates.geometry);

    await rota.update(updates);
    res.json({
      ...rota.toJSON(),
      waypoints: JSON.parse(rota.waypoints),
      geometry: JSON.parse(rota.geometry),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error updating rota"));
  }
};

// Wipe path record Database Cleanup
export const deleteRota = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rota = await Rota.findByPk(id);
    if (!rota) return next(notFoundError("rota", id));

    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";

    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (requester && Number(rota.idFreguesia) !== Number(requester.idFreguesia)) {
        return res.status(403).json({ message: "Forbidden: Cannot delete other parish route" });
      }
    }

    await rota.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting rota"));
  }
};
