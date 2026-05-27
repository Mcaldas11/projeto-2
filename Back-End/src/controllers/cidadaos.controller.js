import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Readable } from "stream";
import { Cidadao } from "../config/db.config.js";
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

export const getAllCidadaos = async (req, res, next) => {
  try {
    const cidadaos = await Cidadao.findAll();
    res.json(cidadaos);
  } catch (error) {
    next(genericError("Error fetching cidadaos"));
  }
};

export const getCidadaoById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cidadao = await Cidadao.findByPk(id);

    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    res.json(cidadao);
  } catch (error) {
    next(genericError("Error fetching cidadao"));
  }
};

export const createCidadao = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const cidadao = await Cidadao.create({ ...rest, credenciais: hashedPassword });

    const token = jwt.sign(
      { userId: cidadao.idCidadao, email: cidadao.email, userType: "cidadao" },
      "your_jwt_secret",
      { expiresIn: "15m" }
    );

    res.status(201).json({
      message: "Cidadao created successfully",
      token,
      userId: cidadao.idCidadao,
      userType: "cidadao",
    });
  } catch (error) {
    console.error("DEBUG:", error);
    if (error?.name === "SequelizeUniqueConstraintError") {
      return next(conflictError({ email: ["Email already in use"] }, "Conflict: Email already in use."));
    }
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating cidadao"));
  }
};

export const loginCidadao = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const cidadao = await Cidadao.findOne({ where: { email } });

    if (!cidadao || !cidadao.credenciais) {
      return res.status(401).json({ message: "Authentication failed. User not found or no password set." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, cidadao.credenciais);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Authentication failed. Wrong password." });
    }

    const token = jwt.sign(
      { userId: cidadao.idCidadao, email: cidadao.email, userType: "cidadao" },
      "your_jwt_secret",
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      userId: cidadao.idCidadao,
      userType: "cidadao",
    });
  } catch (error) {
    next(genericError("Error during login"));
  }
};

export const updateCidadao = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cidadao = await Cidadao.findByPk(id);

    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    await cidadao.update(req.body);
    res.json(cidadao);
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return next(conflictError({ email: ["Email already in use"] }, "Conflict: Email already in use."));
    }
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating cidadao"));
  }
};

export const deleteCidadao = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cidadao = await Cidadao.findByPk(id);

    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    await cidadao.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting cidadao"));
  }
};

export const updateCidadaoFoto = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.userData || req.userData.userType !== "cidadao") {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (Number(req.userData.userId) !== Number(id)) {
      return res.status(403).json({ message: "Forbidden" });
    }

    if (!req.file) {
      return res.status(400).json({ message: "Falta o ficheiro" });
    }

    const cidadao = await Cidadao.findByPk(id);
    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    const upload = await uploadToCloudinary(req.file, `cidadaos/${id}`);
    const newUrl = upload?.secure_url || upload?.url;
    if (!newUrl) {
      return next(genericError("Error uploading fotoPerfil"));
    }

    const oldUrl = cidadao.fotoPerfil;
    await cidadao.update({ fotoPerfil: newUrl });

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
