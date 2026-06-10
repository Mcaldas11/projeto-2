import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Readable } from "stream";
import { Equipa, Municipio, Trabalhador } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.js";
import {
  conflictError,
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

// Resolve image key Cloudinary Utility
const extractPublicIdFromUrl = (url) => {
  if (!url || typeof url !== "string") return null;

  const cleanUrl = url.split("?")[0];
  const marker = "/upload/";
  const markerIndex = cleanUrl.indexOf(marker);
  if (markerIndex === -1) return null;

  let publicPath = cleanUrl.slice(markerIndex + marker.length);
  publicPath = publicPath.replace(/^v\d+\//, "");

  const lastDot = publicPath.lastIndexOf(".");
  if (lastDot > -1) {
    publicPath = publicPath.slice(0, lastDot);
  }

  return publicPath || null;
};

// Validate admin email Configuration
const isAdminEmail = (email) => {
  const adminList = (process.env.ADMIN_EMAILS || "admin@vcc.pt,admin.geral@example.pt")
    .split(",")
    .map((s) => s.trim());
  return adminList.includes((email || "").trim());
};

// Check for admin status Authorization
const isRequesterAdmin = async (req) => {
  if (!req.userData || !req.userData.userType) return false;
  if (req.userData.userType === "trabalhador_admin") return true;
  if (!req.userData.userType.startsWith("trabalhador")) return false;

  const requesterTrab = await Trabalhador.findByPk(req.userData.userId);
  return Boolean(requesterTrab && isAdminEmail(requesterTrab.emailTrabalhador));
};

// Create worker account Authorization
export const createTrabalhador = async (req, res, next) => {
  try {
    const {
      nomeTrabalhador,
      emailTrabalhador,
      telemovelTrabalhador,
      idEquipa,
      idFreguesia,
      password,
    } = req.body;

    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";

    if (!isAdmin && !isResponsavel) {
      return res.status(403).json({ message: "Unauthorized to create workers." });
    }

    let normalizedIdFreguesia = idFreguesia ? Number(idFreguesia) : null;

    // Parish restriction Authorization
    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (!requester) return res.status(403).json({ message: "Manager not found." });

      if (!normalizedIdFreguesia) {
        normalizedIdFreguesia = Number(requester.idFreguesia);
      } else if (normalizedIdFreguesia !== Number(requester.idFreguesia)) {
        return res.status(403).json({
          message: "You can only create workers for your own parish.",
        });
      }
    }

    if (!normalizedIdFreguesia) {
      return res.status(400).json({ message: "idFreguesia is required." });
    }

    // Phone pattern check Sanitization
    const phoneRegex = /^[0-9]{9}$/;
    if (!phoneRegex.test(telemovelTrabalhador)) {
      return res.status(400).json({
        message: "Mobile phone must have exactly 9 numerical digits.",
      });
    }

    // Password encryption Hashing
    const hashedPassword = await bcrypt.hash(password || "default123", 10);

    const trabalhador = await Trabalhador.create({
      nomeTrabalhador,
      emailTrabalhador,
      telemovelTrabalhador,
      idEquipa: idEquipa || null,
      idFreguesia: normalizedIdFreguesia,
      credenciaisTrabalhadores: hashedPassword,
    });

    res.status(201).json({
      message: "Trabalhador created successfully",
      userId: trabalhador.idTrabalhador,
      userType: "trabalhador",
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Conflict: Email already in use." });
    }
    next(genericError("Error creating trabalhador"));
  }
};

// Update worker profile Authorization
export const updateTrabalhador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) return next(notFoundError("trabalhador", id));

    const isAdmin = await isRequesterAdmin(req);
    const isResponsavel = req.userData?.userType === "trabalhador_responsavel";
    const isOwner = Number(req.userData?.userId) === Number(id);

    if (Object.prototype.hasOwnProperty.call(req.body, "fotoPerfil") && !isOwner) {
      delete req.body.fotoPerfil;
    }

    // Parish restriction Authorization
    if (isResponsavel && !isAdmin) {
      const requester = await Trabalhador.findByPk(req.userData.userId);
      if (
        !requester ||
        Number(requester.idFreguesia) !== Number(trabalhador.idFreguesia)
      ) {
        return res.status(403).json({
          message: "Forbidden: You can only manage workers from your own parish.",
        });
      }
    }

    // Team parish check Authorization
    if (Object.prototype.hasOwnProperty.call(req.body, "idEquipa") && req.body.idEquipa) {
      const equipa = await Equipa.findByPk(req.body.idEquipa);
      if (equipa && Number(equipa.fregEquipa) !== Number(trabalhador.idFreguesia)) {
        return res.status(400).json({
          message: "The team must belong to the same parish as the worker.",
        });
      }
    }

    await trabalhador.update(req.body);
    res.json(trabalhador);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error updating trabalhador"));
  }
};
