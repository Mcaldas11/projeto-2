import sequelize from "../config/sequelize.js";

import CidadaoModel from "../models/cidadao.model.js";
import MunicipioModel from "../models/municipio.model.js";
import EquipaModel from "../models/equipa.model.js";
import TrabalhadorModel from "../models/trabalhador.model.js";
import RecursoModel from "../models/recurso.model.js";
import OcorrenciaModel from "../models/ocorrencia.model.js";
import MensagemModel from "../models/mensagem.model.js";

const Cidadao = CidadaoModel(sequelize);
const Municipio = MunicipioModel(sequelize);
const Equipa = EquipaModel(sequelize);
const Trabalhador = TrabalhadorModel(sequelize);
const Recurso = RecursoModel(sequelize);
const Ocorrencia = OcorrenciaModel(sequelize);
const Mensagem = MensagemModel(sequelize);

Municipio.hasMany(Cidadao, { foreignKey: "fregCidadao", as: "cidadaos" });
Cidadao.belongsTo(Municipio, { foreignKey: "fregCidadao", as: "municipio" });

Municipio.hasMany(Equipa, { foreignKey: "fregEquipa", as: "equipas" });
Equipa.belongsTo(Municipio, { foreignKey: "fregEquipa", as: "municipio" });

Equipa.hasMany(Trabalhador, { foreignKey: "idEquipa", as: "trabalhadores" });
Trabalhador.belongsTo(Equipa, { foreignKey: "idEquipa", as: "equipa" });

Equipa.hasMany(Recurso, { foreignKey: "equipaResponsavel", as: "recursos" });
Recurso.belongsTo(Equipa, { foreignKey: "equipaResponsavel", as: "equipa" });

Cidadao.hasMany(Ocorrencia, { foreignKey: "idCidadao", as: "ocorrencias" });
Ocorrencia.belongsTo(Cidadao, { foreignKey: "idCidadao", as: "cidadao" });

Municipio.hasMany(Ocorrencia, { foreignKey: "idFreguesia", as: "ocorrencias" });
Ocorrencia.belongsTo(Municipio, { foreignKey: "idFreguesia", as: "municipio" });

Equipa.hasMany(Ocorrencia, { foreignKey: "idEquipa", as: "ocorrencias" });
Ocorrencia.belongsTo(Equipa, { foreignKey: "idEquipa", as: "equipa" });

Cidadao.hasMany(Mensagem, { foreignKey: "idCidadao", as: "mensagens" });
Mensagem.belongsTo(Cidadao, { foreignKey: "idCidadao", as: "cidadao" });

Ocorrencia.hasMany(Mensagem, { foreignKey: "idOcorrencia", as: "mensagens" });
Mensagem.belongsTo(Ocorrencia, {
  foreignKey: "idOcorrencia",
  as: "ocorrencia",
});

const testConnection = async () => {
  await sequelize.authenticate();
};

const syncDatabase = async () => {
  const shouldSync = process.env.DB_SYNC === "true";
  const forceSync = process.env.DB_SYNC_FORCE === "true";

  if (!shouldSync && !forceSync) {
    return false;
  }

  await sequelize.sync({ force: forceSync });
  return true;
};

/* delete data from the table (municipio) before seeding to avoid duplicates and maintain data integrity */
/* try {
  if (sequelize.getDialect() === "mysql")
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 0");
  await Cidadao.destroy({ truncate: true });
  await Equipa.destroy({ truncate: true });
  await Ocorrencia.destroy({ truncate: true });
  if (sequelize.getDialect() === "mysql")
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
} catch (err) {
  console.error(err);
  if (sequelize.getDialect() === "mysql")
    await sequelize.query("SET FOREIGN_KEY_CHECKS = 1");
  process.exit(1);
}
  */

export {
  sequelize,
  testConnection,
  syncDatabase,
  Cidadao,
  Municipio,
  Equipa,
  Trabalhador,
  Recurso,
  Ocorrencia,
  Mensagem,
};
