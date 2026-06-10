import { Mensagem, Trabalhador } from "../config/db.config.js";
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

// List filtered messages Read
export const getAllMensagens = async (req, res, next) => {
  try {
    const { idOcorrencia, idCidadao } = req.query;
    const where = {};
    if (idOcorrencia) where.idOcorrencia = idOcorrencia;
    if (idCidadao) where.idCidadao = idCidadao;

    const mensagens = await Mensagem.findAll({ where });
    res.json(mensagens);
  } catch (error) {
    next(genericError("Error fetching mensagens"));
  }
};

// Find message by ID Read
export const getMensagemById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
      return next(notFoundError("mensagem", id));
    }

    res.json(mensagem);
  } catch (error) {
    next(genericError("Error fetching mensagem"));
  }
};

// Create feedback entry Database Update
export const createMensagem = async (req, res, next) => {
  try {
    const mensagem = await Mensagem.create(req.body);
    res.status(201).json(mensagem);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }
    next(genericError("Error creating mensagem"));
  }
};

// Edit message entry Authorization
export const updateMensagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
      return next(notFoundError("mensagem", id));
    }

    if (!req.userData) {
      return res.status(401).json({ message: "Authentication required" });
    }

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

    // Ownership verification Authorization
    if (!isAdmin) {
      if (req.userData.userType !== "cidadao" || Number(req.userData.userId) !== Number(mensagem.idCidadao)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    await mensagem.update(req.body);
    res.json(mensagem);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }
    next(genericError("Error updating mensagem"));
  }
};

// Remove message entry Authorization
export const deleteMensagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
      return next(notFoundError("mensagem", id));
    }

    if (!req.userData) {
      return res.status(401).json({ message: "Authentication required" });
    }

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

    // Ownership verification Authorization
    if (!isAdmin) {
      if (req.userData.userType !== "cidadao" || Number(req.userData.userId) !== Number(mensagem.idCidadao)) {
        return res.status(403).json({ message: "Forbidden" });
      }
    }

    await mensagem.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting mensagem"));
  }
};
