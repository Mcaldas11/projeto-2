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

export const validatePassword = (req, res, next) => {
  const { password } = req.body;

  if (!password) {
    return next(validationError({ password: ["Password is required"] }));
  }

  const minLength = 6;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasLowerCase = /[a-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[\W_]/.test(password);

  const errors = [];
  if (password.length < minLength)
    errors.push(`at least ${minLength} characters`);
  if (!hasUpperCase) errors.push("one uppercase letter");
  if (!hasLowerCase) errors.push("one lowercase letter");
  if (!hasNumber) errors.push("one number");
  if (!hasSpecialChar) errors.push("one special character");

  if (errors.length > 0) {
    return next(
      validationError({
        password: [`Password must have ${errors.join(", ")}`],
      }),
    );
  }

  next();
};
