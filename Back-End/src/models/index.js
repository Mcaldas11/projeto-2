import sequelize from "../config/sequelize.js";

import CidadaoModel from "./cidadao.model.js";
import MunicipioModel from "./municipio.model.js";
import EquipaModel from "./equipa.model.js";
import TrabalhadorModel from "./trabalhador.model.js";
import RecursoModel from "./recurso.model.js";
import OcorrenciaModel from "./ocorrencia.model.js";
import MensagemModel from "./mensagem.model.js";

const Cidadao = CidadaoModel(sequelize);
const Municipio = MunicipioModel(sequelize);
const Equipa = EquipaModel(sequelize);
const Trabalhador = TrabalhadorModel(sequelize);
const Recurso = RecursoModel(sequelize);
const Ocorrencia = OcorrenciaModel(sequelize);
const Mensagem = MensagemModel(sequelize);

Municipio.hasMany(Cidadao, { foreignKey: "munCidadao", as: "cidadaos" });
Cidadao.belongsTo(Municipio, { foreignKey: "munCidadao", as: "municipio" });

Municipio.hasMany(Equipa, { foreignKey: "munEquipa", as: "equipas" });
Equipa.belongsTo(Municipio, { foreignKey: "munEquipa", as: "municipio" });

Equipa.hasMany(Trabalhador, { foreignKey: "idEquipa", as: "trabalhadores" });
Trabalhador.belongsTo(Equipa, { foreignKey: "idEquipa", as: "equipa" });

Equipa.hasMany(Recurso, { foreignKey: "equipaResponsavel", as: "recursos" });
Recurso.belongsTo(Equipa, { foreignKey: "equipaResponsavel", as: "equipa" });

Cidadao.hasMany(Ocorrencia, { foreignKey: "idCidadao", as: "ocorrencias" });
Ocorrencia.belongsTo(Cidadao, { foreignKey: "idCidadao", as: "cidadao" });

Municipio.hasMany(Ocorrencia, { foreignKey: "idMunicipio", as: "ocorrencias" });
Ocorrencia.belongsTo(Municipio, { foreignKey: "idMunicipio", as: "municipio" });

Equipa.hasMany(Ocorrencia, { foreignKey: "idEquipa", as: "ocorrencias" });
Ocorrencia.belongsTo(Equipa, { foreignKey: "idEquipa", as: "equipa" });

Cidadao.hasMany(Mensagem, { foreignKey: "idCidadao", as: "mensagens" });
Mensagem.belongsTo(Cidadao, { foreignKey: "idCidadao", as: "cidadao" });

Ocorrencia.hasMany(Mensagem, { foreignKey: "idOcorrencia", as: "mensagens" });
Mensagem.belongsTo(Ocorrencia, { foreignKey: "idOcorrencia", as: "ocorrencia" });

const testConnection = async () => {
  await sequelize.authenticate();
};

export {
  sequelize,
  testConnection,
  Cidadao,
  Municipio,
  Equipa,
  Trabalhador,
  Recurso,
  Ocorrencia,
  Mensagem,
};
