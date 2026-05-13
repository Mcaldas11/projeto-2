import { Mensagem } from "../models/index.js";
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

export const getAllMensagens = async (req, res, next) => {
  try {
    const mensagens = await Mensagem.findAll();
    res.json(mensagens);
  } catch (error) {
    next(genericError("Error fetching mensagens"));
  }
};

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

export const updateMensagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
      return next(notFoundError("mensagem", id));
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

export const deleteMensagem = async (req, res, next) => {
  try {
    const { id } = req.params;
    const mensagem = await Mensagem.findByPk(id);

    if (!mensagem) {
      return next(notFoundError("mensagem", id));
    }

    await mensagem.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting mensagem"));
  }
};
