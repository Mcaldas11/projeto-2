import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { Equipa, Trabalhador } from "../models/index.js";
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
    const { nomeTrabalhador, emailTrabalhador, telemovelTrabalhador, idEquipa, password } = req.body;

    if (!password) {
      return res.status(400).json({ message: "Password is required" });
    }

    if (!idEquipa) {
      return res.status(400).json({ message: "idEquipa is required" });
    }

    const equipa = await Equipa.findByPk(idEquipa);
    if (!equipa) {
      return res.status(400).json({ message: "Invalid idEquipa" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const trabalhador = await Trabalhador.create({
      nomeTrabalhador,
      emailTrabalhador,
      telemovelTrabalhador,
      idEquipa,
      credenciaisTrabalhadores: hashedPassword,
    });

    const token = jwt.sign(
      { userId: trabalhador.idTrabalhador, email: trabalhador.emailTrabalhador, userType: "trabalhador" },
      "your_jwt_secret",
      { expiresIn: "15m" }
    );

    res.status(201).json({
      message: "Trabalhador created successfully",
      token,
      userId: trabalhador.idTrabalhador,
    });
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(409).json({ message: "Conflict: Email already in use." });
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
      return res.status(400).json({ message: "Email and password are required." });
    }

    const trabalhador = await Trabalhador.findOne({ where: { emailTrabalhador: loginEmail } });

    if (!trabalhador || !trabalhador.credenciaisTrabalhadores) {
      return res.status(401).json({ message: "Authentication failed. User not found or no password set." });
    }

    const isPasswordCorrect = await bcrypt.compare(password, trabalhador.credenciaisTrabalhadores);
    if (!isPasswordCorrect) {
      return res.status(401).json({ message: "Authentication failed. Wrong password." });
    }

    const token = jwt.sign(
      { userId: trabalhador.idTrabalhador, email: trabalhador.emailTrabalhador, userType: "trabalhador" },
      "your_jwt_secret",
      { expiresIn: "15m" }
    );

    res.status(200).json({
      message: "Login realizado com sucesso",
      token,
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
