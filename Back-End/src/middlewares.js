import {
  missingFieldsValidationError,
  validationError,
} from "./utils/error.utils.js";

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

export const notFoundMiddleware = (req, res, next) => {
  const error = new Error(`Route ${req.method} ${req.originalUrl} not found`);
  error.status = 404;
  next(error);
};

export const errorHandlerMiddleware = (err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && "body" in err) {
    err.status = 400;
    err.message = "Invalid JSON payload";
  }

  const status = err.status || 500;
  const payload = {
    description: err.message || "Internal server error",
  };

  if (err.errors) {
    payload.errors = err.errors;
  }

  res.status(status).json(payload);
};
