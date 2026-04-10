// cidadao.js
module.exports = (sequelize, DataTypes) => {
  const Cidadao = sequelize.define('Cidadao', {
    idCidadao: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nome: { type: DataTypes.STRING(120), allowNull: false },
    munCidadao: { type: DataTypes.INTEGER, allowNull: true },
    nrTelemovel: { type: DataTypes.STRING(20), allowNull: true },
    email: { type: DataTypes.STRING(150), allowNull: false, unique: true },
  }, {
    tableName: 'cidadao',
    timestamps: false,
  });

  Cidadao.associate = (models) => {
    Cidadao.belongsTo(models.Municipio, { foreignKey: 'munCidadao' });
    Cidadao.hasMany(models.Mensagem, { foreignKey: 'idCidadao' });
    Cidadao.hasMany(models.Ocorrencia, { foreignKey: 'idCidadao' });
  };

  return Cidadao;
};
