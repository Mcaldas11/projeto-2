import { Readable } from "stream";
import { Ocorrencia, Cidadao } from "../config/db.config.js";
import { Trabalhador } from "../config/db.config.js";
import cloudinary from "../config/cloudinary.js";
import {
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

const parseFotosField = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  if (typeof value !== "string") return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [value];
  } catch {
    return [value];
  }
};

const normalizeFotoEntry = (entry) => {
  if (typeof entry === "string") return { url: entry, publicId: null };
  if (!entry || typeof entry !== "object") return { url: null, publicId: null };

  const url = entry.url || entry.secure_url || null;
  const publicId = entry.public_id || entry.publicId || null;

  return { url, publicId };
};

const normalizeFotosField = (value) =>
  parseFotosField(value)
    .map(normalizeFotoEntry)
    .filter((foto) => foto.url);

const buildFotosComIndice = (urls) =>
  urls.map((url, index) => ({ index, url }));

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

const DEFAULT_ESTADO = "À espera da equipa";

export const getAllOcorrencias = async (req, res, next) => {
  try {
    const ocorrencias = await Ocorrencia.findAll();
    const data = ocorrencias.map((ocorrencia) => {
      const fotos = normalizeFotosField(ocorrencia.foto).map((foto) => foto.url);
      return {
        ...ocorrencia.toJSON(),
        foto: buildFotosComIndice(fotos),
      };
    });
    res.json(data);
  } catch (error) {
    next(genericError("Error fetching ocorrencias"));
  }
};

export const getOcorrenciaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const fotos = normalizeFotosField(ocorrencia.foto).map((foto) => foto.url);
    res.json({ ...ocorrencia.toJSON(), foto: buildFotosComIndice(fotos) });
  } catch (error) {
    next(genericError("Error fetching ocorrencia"));
  }
};

export const createOcorrencia = async (req, res, next) => {
  try {
    req.body.estado = DEFAULT_ESTADO;
    const ocorrencia = await Ocorrencia.create(req.body);
    res.status(201).json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating ocorrencia"));
  }
};

export const createOcorrenciaForCidadao = async (req, res, next) => {
  try {
    req.body.estado = DEFAULT_ESTADO;
    // Ensure the idCidadao comes from the authenticated token, not the client
    if (req.userData && req.userData.userId) {
      const userId = req.userData.userId;
      req.body.idCidadao = userId;

      // Populate author name and phone from the authenticated cidadao record
      try {
        const cidadao = await Cidadao.findByPk(userId);
        if (cidadao) {
          req.body.nomeAutor = cidadao.nome;
          req.body.nrTelemovelAutor = cidadao.nrTelemovel;
          // Auto-fill freguesia id from the citizen if not provided
          if (!req.body.idFreguesia && cidadao.fregCidadao) {
            req.body.idFreguesia = cidadao.fregCidadao;
          }
        }
      } catch (err) {
        // ignore and continue; validation/creation will surface issues
      }
    }

    const ocorrencia = await Ocorrencia.create(req.body);
    res.status(201).json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating ocorrencia"));
  }
};

export const getOcorrenciasForCidadao = async (req, res, next) => {
  try {
    if (!req.userData || req.userData.userType !== "cidadao") {
      return res.status(403).json({ message: "Forbidden" });
    }

    const userId = req.userData.userId;
    const ocorrencias = await Ocorrencia.findAll({ where: { idCidadao: userId } });
    const data = ocorrencias.map((ocorrencia) => {
      const fotos = normalizeFotosField(ocorrencia.foto).map((foto) => foto.url);
      return {
        ...ocorrencia.toJSON(),
        foto: buildFotosComIndice(fotos),
      };
    });

    res.json(data);
  } catch (error) {
    next(genericError("Error fetching ocorrencias for cidadao"));
  }
};

export const getOcorrenciasResolvidasForTrabalhador = async (req, res, next) => {
  try {
    if (!req.userData || !req.userData.userType || !req.userData.userType.startsWith("trabalhador")) {
      return res.status(403).json({ message: "Forbidden" });
    }

    const trabalhador = await Trabalhador.findByPk(req.userData.userId);
    if (!trabalhador) {
      return next(notFoundError("trabalhador", req.userData.userId));
    }

    if (!trabalhador.idEquipa) {
      return res.json([]);
    }

    const ocorrencias = await Ocorrencia.findAll({ where: { idEquipa: trabalhador.idEquipa } });
    const data = ocorrencias
      .filter((ocorrencia) => ocorrencia.dataResolucao)
      .map((ocorrencia) => {
        const fotos = normalizeFotosField(ocorrencia.foto).map((foto) => foto.url);
        return {
          ...ocorrencia.toJSON(),
          foto: buildFotosComIndice(fotos),
        };
      })
      .sort((left, right) => {
        const leftDate = left.dataResolucao ? new Date(left.dataResolucao).getTime() : 0;
        const rightDate = right.dataResolucao ? new Date(right.dataResolucao).getTime() : 0;
        return rightDate - leftDate;
      });

    res.json(data);
  } catch (error) {
    next(genericError("Error fetching resolved ocorrencias for trabalhador"));
  }
};

export const updateOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    await ocorrencia.update(req.body);
    res.json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error updating ocorrencia"));
  }
};

export const deleteOcorrencia = async (req, res, next) => {
  try {
    const { id } = req.params;
    const ocorrencia = await Ocorrencia.findByPk(id);

    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    if (!req.userData) {
      return res.status(401).json({ message: "Authentication required" });
    }

    const isCidadaoDaOcorrencia =
      req.userData.userType === "cidadao" &&
      Number(req.userData.userId) === Number(ocorrencia.idCidadao);

    // determine if requester is admin
    let isAdmin = false;
    if (req.userData.userType === "trabalhador_admin") {
      isAdmin = true;
    } else if (req.userData.userType && req.userData.userType.startsWith("trabalhador")) {
      const requesterTrab = await Trabalhador.findByPk(req.userData.userId);
      const adminList = (process.env.ADMIN_EMAILS || "admin@vcc.pt,admin.geral@example.pt").split(",").map((s) => s.trim());
      if (requesterTrab && adminList.includes((requesterTrab.emailTrabalhador || "").trim())) {
        isAdmin = true;
      }
    }

    // only admin or the cidadao who created it can delete
    if (!isAdmin) {
      if (!isCidadaoDaOcorrencia) {
        return res.status(403).json({ message: "Forbidden" });
      }

      if (ocorrencia.estado !== DEFAULT_ESTADO) {
        return res.status(403).json({
          message: "Forbidden: a ocorrencia ja foi assumida por uma equipa",
        });
      }
    }

    // remove fotos from cloudinary
    try {
      const fotos = normalizeFotosField(ocorrencia.foto);
      const publicIds = [
        ...new Set(
          fotos
            .map((foto) => foto.publicId || extractPublicIdFromUrl(foto.url))
            .filter(Boolean),
        ),
      ];

      await Promise.allSettled(
        publicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId, { resource_type: "image", invalidate: true }),
        ),
      );
    } catch (e) {
      console.warn("Failed to cleanup fotos for ocorrencia", id, e?.message || e);
    }

    await ocorrencia.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting ocorrencia"));
  }
};

export const resolveOcorrenciaByEquipa = async (req, res, next) => {
  try {
    const { id } = req.params;

    // Only trabalhadores (including admin) can resolve occurrences
    if (!req.userData || !req.userData.userType || !req.userData.userType.startsWith("trabalhador")) {
      return res.status(403).json({
        message: "Forbidden: only trabalhadores can resolve ocorrencias",
      });
    }

    const trabalhadorId = req.userData.userId;
    const trabalhador = await Trabalhador.findByPk(trabalhadorId);
    if (!trabalhador) {
      return res
        .status(403)
        .json({ message: "Forbidden: trabalhador not found" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    // Determine allowed fields to update by equipa
    const { dataAgendada, feedback, dataResolucao, estado } = req.body;

    const updates = {};
    if (dataAgendada !== undefined) updates.dataAgendada = dataAgendada;
    if (feedback !== undefined) updates.feedback = feedback;
    if (dataResolucao !== undefined) updates.dataResolucao = dataResolucao;
    if (estado !== undefined) updates.estado = estado;

    // Assign equipa if not already set
    if (!ocorrencia.idEquipa && trabalhador.idEquipa) {
      updates.idEquipa = trabalhador.idEquipa;
    }

    await ocorrencia.update(updates);
    res.json(ocorrencia);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error resolving ocorrencia"));
  }
};

export const addOcorrenciaFotos = async (req, res, next) => {
  try {
    const { id } = req.params;

    if (!req.files || !req.files.length) {
      return res.status(400).json({ message: "Falta o ficheiro" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const uploads = await Promise.all(
      req.files.map((file) => uploadToCloudinary(file, `ocorrencias/${id}`)),
    );
    const newFotos = uploads
      .map((result) => result.secure_url || result.url)
      .filter(Boolean);
    const existingFotos = normalizeFotosField(ocorrencia.foto).map(
      (foto) => foto.url,
    );
    const fotos = [...existingFotos, ...newFotos];

    await ocorrencia.update({ foto: JSON.stringify(fotos) });

    res.status(201).json({
      success: true,
      foto: buildFotosComIndice(fotos),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error adding fotos to ocorrencia"));
  }
};

export const replaceOcorrenciaFoto = async (req, res, next) => {
  try {
    const { id, fotoIndex } = req.params;

    if (!req.files || req.files.length !== 1) {
      return res.status(400).json({ message: "Falta o ficheiro" });
    }

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const fotos = normalizeFotosField(ocorrencia.foto);
    const index = Number(fotoIndex);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "fotoIndex invalido" });
    }

    if (index >= fotos.length) {
      return res.status(404).json({ message: "Foto nao encontrada" });
    }

    const upload = await uploadToCloudinary(req.files[0], `ocorrencias/${id}`);
    const newUrl = upload?.secure_url || upload?.url;
    if (!newUrl) {
      return next(genericError("Error uploading foto"));
    }

    const oldFoto = fotos[index];
    fotos[index] = { url: newUrl, publicId: upload?.public_id || null };

    const storedFotos = fotos.map((foto) => foto.url).filter(Boolean);

    await ocorrencia.update({ foto: JSON.stringify(storedFotos) });

    const oldPublicId =
      oldFoto.publicId || extractPublicIdFromUrl(oldFoto.url);
    if (oldPublicId) {
      try {
        const destroyResult = await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
        if (
          destroyResult?.result !== "ok" &&
          destroyResult?.result !== "not found"
        ) {
          console.warn("Cloudinary destroy unexpected result", {
            publicId: oldPublicId,
            result: destroyResult?.result,
          });
        }
      } catch {
        console.warn("Cloudinary destroy failed", { publicId: oldPublicId });
      }
    } else {
      console.warn("Cloudinary public_id not resolved", { url: oldFoto.url });
    }

    res.json({
      success: true,
      foto: buildFotosComIndice(storedFotos),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error replacing foto"));
  }
};

export const deleteOcorrenciaFotos = async (req, res, next) => {
  try {
    const { id } = req.params;

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const fotos = normalizeFotosField(ocorrencia.foto);
    const publicIds = [
      ...new Set(
        fotos
          .map((foto) => foto.publicId || extractPublicIdFromUrl(foto.url))
          .filter(Boolean),
      ),
    ];

    if (publicIds.length > 0) {
      const results = await Promise.allSettled(
        publicIds.map((publicId) =>
          cloudinary.uploader.destroy(publicId, {
            resource_type: "image",
            invalidate: true,
          }),
        ),
      );

      results.forEach((result, index) => {
        if (result.status === "fulfilled") {
          const destroyResult = result.value;
          if (
            destroyResult?.result !== "ok" &&
            destroyResult?.result !== "not found"
          ) {
            console.warn("Cloudinary destroy unexpected result", {
              publicId: publicIds[index],
              result: destroyResult?.result,
            });
          }
        } else {
          console.warn("Cloudinary destroy failed", {
            publicId: publicIds[index],
          });
        }
      });
    }

    await ocorrencia.update({ foto: JSON.stringify([]) });

    res.json({ success: true, foto: [] });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error deleting fotos"));
  }
};

export const deleteOcorrenciaFotoByIndex = async (req, res, next) => {
  try {
    const { id, fotoIndex } = req.params;

    const ocorrencia = await Ocorrencia.findByPk(id);
    if (!ocorrencia) {
      return next(notFoundError("ocorrencia", id));
    }

    const fotos = normalizeFotosField(ocorrencia.foto);
    const index = Number(fotoIndex);

    if (!Number.isInteger(index) || index < 0) {
      return res.status(400).json({ message: "fotoIndex invalido" });
    }

    if (index >= fotos.length) {
      return res.status(404).json({ message: "Foto nao encontrada" });
    }

    const [removed] = fotos.splice(index, 1);
    const storedFotos = fotos.map((foto) => foto.url).filter(Boolean);

    await ocorrencia.update({ foto: JSON.stringify(storedFotos) });

    const oldPublicId =
      removed.publicId || extractPublicIdFromUrl(removed.url);
    if (oldPublicId) {
      try {
        const destroyResult = await cloudinary.uploader.destroy(oldPublicId, {
          resource_type: "image",
          invalidate: true,
        });
        if (
          destroyResult?.result !== "ok" &&
          destroyResult?.result !== "not found"
        ) {
          console.warn("Cloudinary destroy unexpected result", {
            publicId: oldPublicId,
            result: destroyResult?.result,
          });
        }
      } catch {
        console.warn("Cloudinary destroy failed", { publicId: oldPublicId });
      }
    } else {
      console.warn("Cloudinary public_id not resolved", { url: removed.url });
    }

    res.json({
      success: true,
      foto: buildFotosComIndice(storedFotos),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error deleting foto"));
  }
};
