// ocorrencia.js
module.exports = (sequelize, DataTypes) => {
  const Ocorrencia = sequelize.define('Ocorrencia', {
    idOcorrencia: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    foto: { type: DataTypes.STRING(255), allowNull: true },
    descricao: { type: DataTypes.TEXT, allowNull: true },
    localizacao: { type: DataTypes.STRING(255), allowNull: true },
    dataOcorrencia: { type: DataTypes.DATE, allowNull: true, defaultValue: DataTypes.NOW },
    nomeAutor: { type: DataTypes.STRING(120), allowNull: true },
    nrTelemovelAutor: { type: DataTypes.STRING(20), allowNull: true },
    severidade: { type: DataTypes.ENUM('Baixa','Média','Alta'), allowNull: true },
    estado: { type: DataTypes.ENUM('À espera de equipa','Em resolução','Resolvido','Não resolvido'), allowNull: false, defaultValue: 'À espera de equipa' },
    idCidadao: { type: DataTypes.INTEGER, allowNull: true },
    idMunicipio: { type: DataTypes.INTEGER, allowNull: false },
    idEquipa: { type: DataTypes.INTEGER, allowNull: true },
    dataAgendada: { type: DataTypes.DATE, allowNull: true },
    feedback: { type: DataTypes.TEXT, allowNull: true },
    tipo_ocorrencia: { type: DataTypes.STRING(50), allowNull: true },
    dataResolucao: { type: DataTypes.DATE, allowNull: true },
  }, {
    tableName: 'ocorrencia',
    timestamps: false,
  });

  Ocorrencia.associate = (models) => {
    Ocorrencia.belongsTo(models.Cidadao, { foreignKey: 'idCidadao' });
    Ocorrencia.belongsTo(models.Municipio, { foreignKey: 'idMunicipio' });
    Ocorrencia.belongsTo(models.Equipa, { foreignKey: 'idEquipa' });
    Ocorrencia.hasMany(models.Mensagem, { foreignKey: 'idOcorrencia' });
  };

  return Ocorrencia;
};
