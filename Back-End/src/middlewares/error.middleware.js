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
