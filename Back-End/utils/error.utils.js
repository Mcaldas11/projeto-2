// torna mais facil a leitura do sequelize
export const sequelizeValidationError = (errors) => {
  const err = new Error("Validation failed");
  err.status = 400;
  err.errors = errors.reduce((acc, err) => {
    if (acc[err.path]) {
      acc[err.path].push(err.message);
    } else {
      acc[err.path] = [err.message];
    }
    return acc;
  }, {});

  return err;
};

// requisitos de campos obrigatórios em falta
export const missingFieldsValidationError = (missingFields) => {
  const err = new Error("Missing required fields");
  err.status = 400;
  err.errors = missingFields.map((field) => ({
    [field.toLowerCase()]: `${field} is required`,
  }));
  return err;
};

// validação de campos personalizados
export const validationError = (errors) => {
  const err = new Error("Validation failed");
  err.status = 400;
  err.errors = errors;
  return err;
};

// recurso não encontrado
export const notFoundError = (resource, id) => {
  resource = resource.toLowerCase();

  const err = new Error("Resource not found");
  err.status = 404;
  err.errors = {
    [resource]: `Resource ${resource} with ID ${id} not found`,
  };
  return err;
};

// erro genérico para falhas inesperadas
export const genericError = (message = "Internal Server Error") => {
  const err = new Error(message);
  err.status = 500;
  return err;
};

// conflito de dados, como email já existente
export const conflictError = (message) => {
  const err = new Error(message);
  err.status = 409;
  return err;
};
