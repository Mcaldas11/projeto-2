import {
  missingFieldsValidationError,
  validationError,
} from "../utils/error.utils.js";

export const validateIntegerParam = (paramName = "id") => (req, res, next) => {
  const value = Number(req.params[paramName]);

  if (!Number.isInteger(value) || value <= 0) {
    return next(
      validationError({
        [paramName]: [`${paramName} must be a positive integer`],
      }),
    );
  }

  return next();
};

export const requireJsonObject = (req, res, next) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return next(
      validationError({
        body: ["Request body must be a JSON object"],
      }),
    );
  }

  return next();
};

export const requireFields = (fields) => (req, res, next) => {
  if (!Array.isArray(fields) || fields.length === 0) {
    return next();
  }

  const missingFields = fields.filter(
    (field) =>
      req.body[field] === undefined || req.body[field] === null || req.body[field] === "",
  );

  if (missingFields.length > 0) {
    return next(missingFieldsValidationError(missingFields));
  }

  return next();
};
