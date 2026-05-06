// database/models/index.js
const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database.js');

const sequelize = new Sequelize(config.database, config.username, config.password, config);

// Import models
const Municipio = require('./municipio.js')(sequelize, DataTypes);
const Cidadao = require('./cidadao.js')(sequelize, DataTypes);
const Equipa = require('./equipa.js')(sequelize, DataTypes);
const Trabalhador = require('./trabalhador.js')(sequelize, DataTypes);
const Recurso = require('./recurso.js')(sequelize, DataTypes);
const Ocorrencia = require('./ocorrencia.js')(sequelize, DataTypes);
const Mensagem = require('./mensagem.js')(sequelize, DataTypes);

const models = { Municipio, Cidadao, Equipa, Trabalhador, Recurso, Ocorrencia, Mensagem };

Object.values(models).forEach((model) => { if (model.associate) model.associate(models); });

module.exports = { sequelize, Sequelize, ...models };
