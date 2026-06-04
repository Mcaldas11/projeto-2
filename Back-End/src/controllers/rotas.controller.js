import { Rota } from "../config/db.config.js";
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

export const getAllRotas = async (req, res, next) => {
  try {
    const rotas = await Rota.findAll();
    const data = rotas.map((r) => ({
      ...r.toJSON(),
      waypoints: JSON.parse(r.waypoints || "[]"),
      geometry: JSON.parse(r.geometry || "[]"),
    }));
    res.json(data);
  } catch (error) {
    next(genericError("Error fetching rotas"));
  }
};

export const getRotaById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rota = await Rota.findByPk(id);
    if (!rota) return next(notFoundError("rota", id));

    res.json({
      ...rota.toJSON(),
      waypoints: JSON.parse(rota.waypoints || "[]"),
      geometry: JSON.parse(rota.geometry || "[]"),
    });
  } catch (error) {
    next(genericError("Error fetching rota"));
  }
};

export const createRota = async (req, res, next) => {
  try {
    const { nome, idFreguesia, waypoints, geometry, cor } = req.body;
    const rota = await Rota.create({
      nome,
      idFreguesia,
      waypoints: JSON.stringify(waypoints || []),
      geometry: JSON.stringify(geometry || []),
      cor,
    });
    res.status(201).json({
      ...rota.toJSON(),
      waypoints: JSON.parse(rota.waypoints),
      geometry: JSON.parse(rota.geometry),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error creating rota"));
  }
};

export const updateRota = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rota = await Rota.findByPk(id);
    if (!rota) return next(notFoundError("rota", id));

    const updates = { ...req.body };
    if (updates.waypoints) updates.waypoints = JSON.stringify(updates.waypoints);
    if (updates.geometry) updates.geometry = JSON.stringify(updates.geometry);

    await rota.update(updates);
    res.json({
      ...rota.toJSON(),
      waypoints: JSON.parse(rota.waypoints),
      geometry: JSON.parse(rota.geometry),
    });
  } catch (error) {
    if (handleSequelizeValidation(error, next)) return;
    next(genericError("Error updating rota"));
  }
};

export const deleteRota = async (req, res, next) => {
  try {
    const { id } = req.params;
    const rota = await Rota.findByPk(id);
    if (!rota) return next(notFoundError("rota", id));
    await rota.destroy();
    res.status(204).send();
  } catch (error) {
    next(genericError("Error deleting rota"));
  }
};
