import { createMunicipio } from "./municipio.js";
import { createCidadao } from "./cidadao.js";
import { createEquipa } from "./equipa.js";
import { createTrabalhador } from "./trabalhador.js";
import { createRecurso } from "./recurso.js";
import { createOcorrencia } from "./ocorrencia.js";
import { createMensagem } from "./mensagem.js";

export function initializeModels(sequelize) {
  const Municipio = createMunicipio(sequelize);
  const Cidadao = createCidadao(sequelize);
  const Equipa = createEquipa(sequelize);
  const Trabalhador = createTrabalhador(sequelize);
  const Recurso = createRecurso(sequelize);
  const Ocorrencia = createOcorrencia(sequelize);
  const Mensagem = createMensagem(sequelize);

  const models = {
    Municipio,
    Cidadao,
    Equipa,
    Trabalhador,
    Recurso,
    Ocorrencia,
    Mensagem,
  };

  // Setup associations
  Object.values(models).forEach((model) => {
    if (model.associate) {
      model.associate(models);
    }
  });

  return models;
}

export {
  createMunicipio,
  createCidadao,
  createEquipa,
  createTrabalhador,
  createRecurso,
  createOcorrencia,
  createMensagem,
};
