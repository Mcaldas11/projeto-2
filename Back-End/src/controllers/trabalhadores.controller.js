import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Trabalhador } from "../models/index.js";
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

export const getAllTrabalhadores = async (req, res, next) => {
  try {
    const trabalhadores = await Trabalhador.findAll();
    res.json(trabalhadores);
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

export const createTrabalhador = async (req, res, next) => {
  try {
    const { password, ...rest } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);
    // Ensure the request body matches the model fields
    const trabalhadorData = {
      nomeTrabalhador: rest.nome,
      emailTrabalhador: rest.email,
      telemovelTrabalhador: rest.nrTelemovel,
      idEquipa: rest.idEquipa,
      credenciaisTrabalhadores: hashedPassword,
    };
    const trabalhador = await Trabalhador.create(trabalhadorData);
    res.status(201).json(trabalhador);
  } catch (error) {
    if (handleSequelizeValidation(error, next)) {
      return;
    }

    next(genericError("Error creating trabalhador"));
  }
};

export const loginTrabalhador = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const trabalhador = await Trabalhador.findOne({ where: { emailTrabalhador: email } });

    if (!trabalhador || !trabalhador.credenciaisTrabalhadores) {
      return res.status(401).json({ message: "Authentication failed. User not found or no password set." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, trabalhador.credenciaisTrabalhadores);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Authentication failed. Wrong password." });
    }

    const token = jwt.sign(
      { userId: trabalhador.idTrabalhador, email: trabalhador.emailTrabalhador, userType: "trabalhador" }, // Assuming all are 'trabalhador' for now
      "your_jwt_secret",
      { expiresIn: "15min" }
    );

    res.status(200).json({
      token,
      expiresIn: 900,
      userId: trabalhador.idTrabalhador,
      userType: "trabalhador",
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

    await trabalhador.update(req.body);
    res.json(trabalhador);
  } catch (error) {
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

    await trabalhador.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting trabalhador"));
  }
};
