// mensagem.js
module.exports = (sequelize, DataTypes) => {
  const Mensagem = sequelize.define('Mensagem', {
    idMensagem: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    texto: { type: DataTypes.TEXT, allowNull: true },
    dataMensagem: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    classificacao: { type: DataTypes.TINYINT, allowNull: true },
    idCidadao: { type: DataTypes.INTEGER, allowNull: false },
    idOcorrencia: { type: DataTypes.INTEGER, allowNull: false },
  }, {
    tableName: 'mensagem',
    timestamps: false,
  });

  Mensagem.associate = (models) => {
    Mensagem.belongsTo(models.Cidadao, { foreignKey: 'idCidadao' });
    Mensagem.belongsTo(models.Ocorrencia, { foreignKey: 'idOcorrencia' });
  };

  return Mensagem;
};
