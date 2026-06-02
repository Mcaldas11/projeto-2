import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Readable } from "stream";
import {
  Cidadao,
  Ocorrencia,
  Mensagem,
  Trabalhador,
} from "../config/db.config.js";
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

export const getCidadaoMe = async (req, res, next) => {
  try {
    if (!req.userData || req.userData.userType !== "cidadao") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const cidadao = await Cidadao.findByPk(req.userData.userId, {
      attributes: [
        "idCidadao",
        "nome",
        "fregCidadao",
        "nrTelemovel",
        "email",
        "fotoPerfil",
      ],
    });

    if (!cidadao) {
      return next(notFoundError("cidadao", req.userData.userId));
    }

    res.json(cidadao);
  } catch (error) {
    next(genericError("Error fetching cidadao profile"));
  }
};

export const updateCidadaoMe = async (req, res, next) => {
  try {
    if (!req.userData || req.userData.userType !== "cidadao") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const cidadao = await Cidadao.findByPk(req.userData.userId);

    if (!cidadao) {
      return next(notFoundError("cidadao", req.userData.userId));
    }

    const updates = {};

    const normalizeFullName = (value) => {
      const parts = String(value || "")
        .trim()
        .split(/\s+/)
        .filter(Boolean);
      return parts.join(" ");
    };

    if (Object.prototype.hasOwnProperty.call(req.body, "nome")) {
      updates.nome = normalizeFullName(req.body.nome);
    } else if (req.body.firstName || req.body.lastName || req.body.apelido) {
      const { firstName, lastName, apelido } = req.body;
      const fullName = [firstName, lastName || apelido]
        .filter(Boolean)
        .join(" ");
      updates.nome = normalizeFullName(fullName);
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "email")) {
      updates.email = req.body.email;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "nrTelemovel")) {
      updates.nrTelemovel = req.body.nrTelemovel;
    } else if (Object.prototype.hasOwnProperty.call(req.body, "telemovel")) {
      updates.nrTelemovel = req.body.telemovel;
    }

    if (Object.prototype.hasOwnProperty.call(req.body, "fregCidadao")) {
      updates.fregCidadao = req.body.fregCidadao;
    } else if (Object.prototype.hasOwnProperty.call(req.body, "idFreguesia")) {
      updates.fregCidadao = req.body.idFreguesia;
    }

    if (Object.keys(updates).length > 0) {
      await cidadao.update(updates);
    }

    const updatedCidadao = await Cidadao.findByPk(req.userData.userId, {
      attributes: [
        "idCidadao",
        "nome",
        "fregCidadao",
        "nrTelemovel",
        "email",
        "fotoPerfil",
      ],
    });

    res.json(updatedCidadao);
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError(
          { email: ["Email already in use"] },
          "Conflict: Email already in use.",
        ),
      );
    }
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating cidadao profile"));
  }
};

export const createCidadao = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    const cidadao = await Cidadao.create({
      ...rest,
      credenciais: hashedPassword,
    });

    const token = jwt.sign(
      { userId: cidadao.idCidadao, email: cidadao.email, userType: "cidadao" },
      "your_jwt_secret",
      { expiresIn: "15m" },
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
      return next(
        conflictError(
          { email: ["Email already in use"] },
          "Conflict: Email already in use.",
        ),
      );
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
      return res
        .status(401)
        .json({
          message: "Authentication failed. User not found or no password set.",
        });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      cidadao.credenciais,
    );
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Authentication failed. Wrong password." });
    }

    const token = jwt.sign(
      { userId: cidadao.idCidadao, email: cidadao.email, userType: "cidadao" },
      "your_jwt_secret",
      { expiresIn: "15m" },
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

    // Security check: only admin or the user themselves
    let isAdmin = false;
    if (req.userData.userType === "trabalhador_admin") {
      isAdmin = true;
    }

    if (!isAdmin && (req.userData.userType !== "cidadao" || Number(req.userData.userId) !== Number(id))) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const cidadao = await Cidadao.findByPk(id);
    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    const { firstName, lastName, email, nome, ...rest } = req.body;
    
    // Apply general updates
    cidadao.set(rest);

    // Handle name
    if (firstName !== undefined || lastName !== undefined) {
      const currentName = cidadao.nome || "";
      const nameParts = currentName.split(" ");
      const newFirstName = firstName !== undefined ? firstName : (nameParts[0] || "");
      const newLastName = lastName !== undefined ? lastName : (nameParts.slice(1).join(" ") || "");
      cidadao.nome = `${newFirstName} ${newLastName}`.trim();
    } else if (nome !== undefined) {
      cidadao.nome = nome;
    }

    // Handle email
    if (email !== undefined) {
      cidadao.email = email;
    }

    await cidadao.save();
    
    // Fetch updated data to return
    const updatedCidadao = await Cidadao.findByPk(id, {
      attributes: ["idCidadao", "nome", "email", "fregCidadao", "nrTelemovel", "fotoPerfil"]
    });

    res.json(updatedCidadao);
  } catch (error) {
    if (error?.name === "SequelizeUniqueConstraintError") {
      return next(
        conflictError(
          { email: ["Email already in use"] },
          "Conflict: Email already in use.",
        ),
      );
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

    // TT_ desnecessário
    if (!req.userData) {
      return res.status(401).json({ message: "Authentication required" });
    }

    // determine if requester is admin (configured via env or fallback emails)
    let isAdmin = false;
    if (req.userData.userType === "trabalhador_admin") {
      isAdmin = true;
    } else if (
      req.userData.userType &&
      req.userData.userType.startsWith("trabalhador")
    ) {
      const requesterTrab = await Trabalhador.findByPk(req.userData.userId);
      const adminList = (process.env.ADMIN_EMAILS || "admin@vcc.pt")
        .split(",")
        .map((s) => s.trim());
      if (
        requesterTrab &&
        adminList.includes((requesterTrab.emailTrabalhador || "").trim())
      ) {
        isAdmin = true;
      }
    }

    // only admin or the user themself can delete account
    if (!isAdmin) {
      if (
        req.userData.userType !== "cidadao" ||
        Number(req.userData.userId) !== Number(id)
      ) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    const cidadao = await Cidadao.findByPk(id);
    if (!cidadao) {
      return next(notFoundError("cidadao", id));
    }

    // remove profile photo from Cloudinary before deleting the account
    const oldFotoPerfil = cidadao.fotoPerfil;
    const oldPublicId = extractPublicIdFromUrl(oldFotoPerfil);
    if (oldPublicId) {
      try {
        await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
      } catch (err) {
        console.warn(
          "Cloudinary destroy failed for fotoPerfil",
          oldPublicId,
          err?.message || err,
        );
      }
    }

    // delete mensagens by this cidadao
    try {
      await Mensagem.destroy({ where: { idCidadao: id } });
    } catch (e) {
      // ignore failures but log
      console.warn(
        "Failed to delete mensagens for cidadao",
        id,
        e.message || e,
      );
    }

    // delete ocorrencias AND their fotos from Cloudinary
    try {
      const ocorrencias = await Ocorrencia.findAll({
        where: { idCidadao: id },
      });
      for (const occ of ocorrencias) {
        const fotosField = occ.foto;
        let fotosArr = [];
        if (fotosField) {
          try {
            const parsed = JSON.parse(fotosField);
            fotosArr = Array.isArray(parsed) ? parsed : [parsed];
          } catch {
            fotosArr = [fotosField];
          }
        }

        const publicIds = [
          ...new Set(
            fotosArr
              .map((f) => {
                if (!f) return null;
                if (typeof f === "object")
                  return f.publicId || f.public_id || null;
                if (typeof f === "string") {
                  const cleanUrl = f.split("?")[0];
                  const marker = "/upload/";
                  const markerIndex = cleanUrl.indexOf(marker);
                  if (markerIndex === -1) return null;
                  let publicPath = cleanUrl.slice(markerIndex + marker.length);
                  publicPath = publicPath.replace(/^v\d+\//, "");
                  const lastDot = publicPath.lastIndexOf(".");
                  if (lastDot > -1) publicPath = publicPath.slice(0, lastDot);
                  return publicPath || null;
                }
                return null;
              })
              .filter(Boolean),
          ),
        ];

        for (const pid of publicIds) {
          try {
            await cloudinary.uploader.destroy(pid, {
              resource_type: "image",
              invalidate: true,
            });
          } catch (err) {
            console.warn(
              "Cloudinary destroy failed for",
              pid,
              err?.message || err,
            );
          }
        }

        try {
          await occ.destroy();
        } catch (e) {
          console.warn(
            "Failed to destroy ocorrencia",
            occ.idOcorrencia,
            e?.message || e,
          );
        }
      }
    } catch (e) {
      console.warn(
        "Failed to cleanup ocorrencias for cidadao",
        id,
        e?.message || e,
      );
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
