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

const isAdminEmail = (email) => {
  const adminList = (
    process.env.ADMIN_EMAILS ||
    "admin@vcc.pt,admin.geral@example.pt,admin_e2e_test@vcc.pt"
  )
    .split(",")
    .map((s) => s.trim().toLowerCase());
  return adminList.includes((email || "").trim().toLowerCase());
};

// Check for admin status Authorization
const isRequesterAdmin = async (req) => {
  if (!req.userData || !req.userData.userType) return false;
  if (req.userData.userType === "trabalhador_admin") return true;
  if (!req.userData.userType.startsWith("trabalhador")) return false;

  const requesterTrab = await Trabalhador.findByPk(req.userData.userId);
  return Boolean(requesterTrab && isAdminEmail(requesterTrab.emailTrabalhador));
};

// List all workers Read
export const getAllTrabalhadores = async (req, res, next) => {
  try {
    const trabalhadores = await Trabalhador.findAll();
    res.json(trabalhadores);
  } catch (error) {
    next(genericError("Error fetching trabalhadores"));
  }
};

// Find worker by ID Read
export const getTrabalhadorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);
    if (!trabalhador) return next(notFoundError("trabalhador", id));
    res.json(trabalhador);
  } catch (error) {
    next(genericError("Error fetching trabalhador"));
  }
};

// Get worker profile from token Authentication
export const getTrabalhadorMe = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador) return next(notFoundError("trabalhador", req.userData.userId));
    res.json(trabalhador);
  } catch (error) {
    next(genericError("Error fetching worker profile"));
  }
};

// Update own profile Update
export const updateTrabalhadorMe = async (req, res, next) => {
  try {
    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador) return next(notFoundError("trabalhador", req.userData.userId));

    await trabalhador.update(req.body);
    res.json(trabalhador);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error updating worker profile"));
  }
};

// Worker login Authentication
export const loginTrabalhador = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const trabalhador = await Trabalhador.findOne({
      where: { emailTrabalhador: email },
    });

    if (!trabalhador || !trabalhador.credenciaisTrabalhadores) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(
      password,
      trabalhador.credenciaisTrabalhadores,
    );
    if (!isMatch) return res.status(401).json({ message: "Invalid credentials" });

    const isAdmin = isAdminEmail(trabalhador.emailTrabalhador);
    // Detect responsavel based on email pattern (matches frontend heuristic)
    const isResponsavel = (email || "").trim().toLowerCase().startsWith("responsavel.");
    
    const userType = isAdmin ? "trabalhador_admin" : 
                    isResponsavel ? "trabalhador_responsavel" : "trabalhador";

    const token = jwt.sign(
      { userId: trabalhador.idTrabalhador, email, userType },
      "your_jwt_secret",
      { expiresIn: "24h" },
    );

    res.json({ token, userId: trabalhador.idTrabalhador, userType });
  } catch (error) {
    next(genericError("Error during login"));
  }
};

// Update worker photo Cloudinary Utility
export const updateTrabalhadorFoto = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);
    if (!trabalhador) return next(notFoundError("trabalhador", id));

    if (!req.file) return res.status(400).json({ message: "No file provided" });

    const upload = await uploadToCloudinary(req.file, `trabalhadores/${id}`);
    const url = upload.secure_url || upload.url;

    const oldPublicId = extractPublicIdFromUrl(trabalhador.fotoPerfil);
    if (oldPublicId) {
      await cloudinary.uploader.destroy(oldPublicId).catch(() => {});
    }

    await trabalhador.update({ fotoPerfil: url });
    res.json({ success: true, fotoPerfil: url });
  } catch (error) {
    next(genericError("Error updating photo"));
  }
};

// Delete worker account Cascading Cleanup
export const deleteTrabalhador = async (req, res, next) => {
  try {
    const { id } = req.params;
    const trabalhador = await Trabalhador.findByPk(id);
    if (!trabalhador) return next(notFoundError("trabalhador", id));

    const publicId = extractPublicIdFromUrl(trabalhador.fotoPerfil);
    if (publicId) {
      await cloudinary.uploader.destroy(publicId).catch(() => {});
    }

    await trabalhador.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting trabalhador"));
  }
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
