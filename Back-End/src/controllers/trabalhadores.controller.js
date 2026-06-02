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

const uploadToCloudinary = (file, folder) =>
  new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    Readable.from(file.buffer).pipe(stream);
  });

const getAdminEmails = () =>
  (process.env.ADMIN_EMAILS || "admin@vcc.pt,admin.geral@example.pt")
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const isAdminEmail = (email) => getAdminEmails().includes((email || "").trim());

const getResponsavelEmails = () =>
  (
    process.env.RESPONSAVEL_EMAILS ||
    process.env.RESPONSAVEL_EMAIL ||
    "responsavel.1@vcc.pt"
  )
    .split(",")
    .map((email) => email.trim())
    .filter(Boolean);

const isResponsavelEmail = (email) =>
  getResponsavelEmails().includes((email || "").trim());

const isRequesterAdmin = async (req) => {
  if (!req.userData || !req.userData.userType) {
    return false;
  }

  if (req.userData.userType === "trabalhador_admin") {
    return true;
  }

  if (!req.userData.userType.startsWith("trabalhador")) {
    return false;
  }

  const requesterTrab = await Trabalhador.findByPk(req.userData.userId);
  return Boolean(requesterTrab && isAdminEmail(requesterTrab.emailTrabalhador));
};

const canManageWorkerAccount = async (req, trabalhadorId) => {
  if (!req.userData) {
    return false;
  }

  if (
    Number(req.userData.userId) === Number(trabalhadorId) &&
    req.userData.userType?.startsWith("trabalhador")
  ) {
    return true;
  }

  return isRequesterAdmin(req);
};

const normalizeFullName = (value) => {
  const parts = String(value || "")
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  return parts.join(" ");
};

export const getAllTrabalhadores = async (req, res, next) => {
  try {
    const trabalhadores = await Trabalhador.findAll();
    const filtered = trabalhadores.filter((t) => {
      const email = (t.emailTrabalhador || "").trim();
      return !isAdminEmail(email);
    });

    res.json(filtered);
  } catch (error) {
    next(genericError("Error fetching trabalhadores"));
  }
};

export const getTrabalhadorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    res.json(trabalhador);
  } catch (error) {
    next(genericError("Error fetching trabalhador"));
  }
};

export const getTrabalhadorMe = async (req, res, next) => {
  try {
    if (
      !req.userData ||
      !req.userData.userType ||
      !req.userData.userType.startsWith("trabalhador")
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const trabalhador = await Trabalhador.findByPk(req.userData.userId, {
      attributes: [
        "idTrabalhador",
        "nomeTrabalhador",
        "emailTrabalhador",
        "telemovelTrabalhador",
        "idEquipa",
        "idFreguesia",
        "fotoPerfil",
      ],
    });

    if (!trabalhador) {
      return next(notFoundError("trabalhador", req.userData.userId));
    }

    res.json(trabalhador);
  } catch (error) {
    next(genericError("Error fetching trabalhador profile"));
  }
};

export const updateTrabalhadorMe = async (req, res, next) => {
  try {
    if (
      !req.userData ||
      !req.userData.userType ||
      !req.userData.userType.startsWith("trabalhador")
    ) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const trabalhador = await Trabalhador.findByPk(req.userData.userId);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", req.userData.userId));
    }

    const updates = {};

    if (Object.prototype.hasOwnProperty.call(req.body, "nomeTrabalhador")) {
      updates.nomeTrabalhador = normalizeFullName(req.body.nomeTrabalhador);
    } else if (req.body.firstName || req.body.lastName || req.body.apelido) {
      const { firstName, lastName, apelido } = req.body;
      const fullName = [firstName, lastName || apelido]
        .filter(Boolean)
        .join(" ");
      updates.nomeTrabalhador = normalizeFullName(fullName);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "emailTrabalhador")) {
      updates.emailTrabalhador = req.body.emailTrabalhador;
    } else if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
      updates.emailTrabalhador = req.body.email;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "telemovelTrabalhador")) {
      updates.telemovelTrabalhador = req.body.telemovelTrabalhador;
    } else if (Object.prototype.hasOwnProperty.call(req.body, "nrTelemovel")) {
      updates.telemovelTrabalhador = req.body.nrTelemovel;
    } else if (Object.prototype.hasOwnProperty.call(req.body, "telemovel")) {
      updates.telemovelTrabalhador = req.body.telemovel;
    }

    // Only apply updates if we have something to update
    if (Object.keys(updates).length > 0) {
      await trabalhador.update(updates);
    }

    const updatedTrabalhador = await Trabalhador.findByPk(req.userData.userId, {
      attributes: [
        "idTrabalhador",
        "nomeTrabalhador",
        "emailTrabalhador",
        "telemovelTrabalhador",
        "idEquipa",
        "idFreguesia",
        "fotoPerfil",
      ],
    });

    res.json(updatedTrabalhador);
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError(
          { emailTrabalhador: ["Email already in use"] },
          "Conflict: Email already in use.",
        ),
      );
    }

    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating trabalhador profile"));
  }
};

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

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    const hasIdEquipa =
      idEquipa !== undefined && idEquipa !== null && idEquipa !== "";
    let normalizedIdEquipa = null;

    if (hasIdEquipa) {
      normalizedIdEquipa = Number(idEquipa);

      if (!Number.isInteger(normalizedIdEquipa) || normalizedIdEquipa <= 0) {
        return res.status(400).json({ message: "Invalid idEquipa" });
      }

      const equipa = await Equipa.findByPk(normalizedIdEquipa);
      if (!equipa) {
        return res.status(400).json({ message: "Invalid idEquipa" });
      }
    }

    const normalizedIdFreguesia = Number(idFreguesia);
    if (!Number.isInteger(normalizedIdFreguesia) || normalizedIdFreguesia <= 0) {
      return res.status(400).json({ message: "Invalid idFreguesia" });
    }

    const municipio = await Municipio.findByPk(normalizedIdFreguesia);
    if (!municipio) {
      return res.status(400).json({ message: "Invalid idFreguesia" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const trabalhador = await Trabalhador.create({
      nomeTrabalhador,
      emailTrabalhador,
      telemovelTrabalhador,
      idEquipa: normalizedIdEquipa,
      idFreguesia: normalizedIdFreguesia,
      credenciaisTrabalhadores: hashedPassword,
    });

    const token = jwt.sign(
      {
        userId: trabalhador.idTrabalhador,
        email: trabalhador.emailTrabalhador,
        userType: "trabalhador",
      },
      "your_jwt_secret",
      { expiresIn: "15m" },
    );

    res.status(201).json({
      message: "Trabalhador created successfully",
      token,
      userId: trabalhador.idTrabalhador,
      userType: "trabalhador",
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res
        .status(409)
        .json({ message: "Conflict: Email already in use." });
    }
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    console.error("Create trabalhador failed:", error);
    return next(error);
  }
};

export const loginTrabalhador = async (req, res, next) => {
  try {
    const { email, emailTrabalhador, password } = req.body;
    const loginEmail = emailTrabalhador || email;

    if (!loginEmail || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required." });
    }

    const trabalhador = await Trabalhador.findOne({
      where: { emailTrabalhador: loginEmail },
    });

    if (!trabalhador || !trabalhador.credenciaisTrabalhadores) {
      return res.status(401).json({
        message: "Authentication failed. User not found or no password set.",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      trabalhador.credenciaisTrabalhadores,
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
    }

    const isAdmin = isAdminEmail(trabalhador.emailTrabalhador);
    const isResponsavel = isResponsavelEmail(trabalhador.emailTrabalhador);

    const tokenUserType = isAdmin
      ? "trabalhador_admin"
      : isResponsavel
        ? "trabalhador_responsavel"
        : "trabalhador";

    const token = jwt.sign(
      {
        userId: trabalhador.idTrabalhador,
        email: trabalhador.emailTrabalhador,
        userType: tokenUserType,
      },
      "your_jwt_secret",
      { expiresIn: "15m" },
    );

    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
      userId: trabalhador.idTrabalhador,
      userType: tokenUserType,
    });
  } catch (error) {
    next(genericError("Error during login"));
  }
};

export const updateTrabalhador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    const isAdmin = await isRequesterAdmin(req);

    if (Object.prototype.hasOwnProperty.call(req.body, "idEquipa")) {
      const { idEquipa } = req.body;

      if (idEquipa === "" || idEquipa === null) {
        // clearing team requires admin
        if (!isAdmin)
          return res.status(403).json({ message: "Only admin can clear team" });
        req.body.idEquipa = null;
      } else {
        const normalizedIdEquipa = Number(idEquipa);
        if (!Number.isInteger(normalizedIdEquipa) || normalizedIdEquipa <= 0) {
          return res.status(400).json({ message: "Invalid idEquipa" });
        }

        const equipa = await Equipa.findByPk(normalizedIdEquipa);
        if (!equipa) {
          return res.status(400).json({ message: "Invalid idEquipa" });
        }

        const teamFreg = Number(equipa.fregEquipa);
        if (!Number.isInteger(teamFreg) || teamFreg <= 0) {
          return res.status(400).json({
            message: "Equipa sem freguesia atribuida.",
          });
        }

        if (!trabalhador.idFreguesia) {
          // if worker has no freguesia yet, inherit it from the assigned team
          req.body.idFreguesia = teamFreg;
        } else if (teamFreg !== Number(trabalhador.idFreguesia)) {
          return res.status(400).json({
            message: "A equipa deve ser da mesma freguesia do trabalhador.",
          });
        }

        // only admin can change the active team
        if (!isAdmin) {
          return res
            .status(403)
            .json({ message: "Only admin can change team" });
        }

        req.body.idEquipa = normalizedIdEquipa;
      }
    }

    await trabalhador.update(req.body);
    res.json(trabalhador);
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError(
          { emailTrabalhador: ["Email already in use"] },
          "Conflict: Email already in use.",
        ),
      );
    }
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating trabalhador"));
  }
};

export const deleteTrabalhador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);

    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    const canManage = await canManageWorkerAccount(req, id);
    if (!canManage) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (isAdminEmail(trabalhador.emailTrabalhador)) {
      return res.status(403).json({ message: "Admin cannot be deleted" });
    }

    const oldFotoPerfil = trabalhador.fotoPerfil;
    const oldPublicId = extractPublicIdFromUrl(oldFotoPerfil);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch {
        // ignore cleanup errors
      }
    }

    await trabalhador.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting trabalhador"));
  }
};

export const updateTrabalhadorFoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    const canManage = await canManageWorkerAccount(req, id);
    if (!canManage) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Falta o ficheiro" });
    }

    const trabalhador = await Trabalhador.findByPk(id);
    if (!trabalhador) {
      return next(notFoundError("trabalhador", id));
    }

    const upload = await uploadToCloudinary(req.file, `trabalhadores/${id}`);
    const newUrl = upload?.secure_url || upload?.url;
    if (!newUrl) {
      return next(genericError("Error uploading fotoPerfil"));
    }

    const oldUrl = trabalhador.fotoPerfil;
    await trabalhador.update({ fotoPerfil: newUrl });

    const oldPublicId = extractPublicIdFromUrl(oldUrl);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch {
        // ignore cleanup errors
      }
    }

    res.json({ success: true, fotoPerfil: newUrl });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating fotoPerfil"));
  }
};
