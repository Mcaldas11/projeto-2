// recurso.js
module.exports = (sequelize, DataTypes) => {
  const Recurso = sequelize.define('Recurso', {
    idRecurso: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    tipo: { type: DataTypes.STRING(106), allowNull: true },
    estado: { type: DataTypes.STRING(50), allowNull: true },
    especificacoes: { type: DataTypes.TEXT, allowNull: true },
    localizacao: { type: DataTypes.STRING(255), allowNull: true },
    equipaResponsavel: { type: DataTypes.INTEGER, allowNull: true },
  }, {
    tableName: 'recurso',
    timestamps: false,
  });

  Recurso.associate = (models) => {
    Recurso.belongsTo(models.Equipa, { foreignKey: 'equipaResponsavel' });
  };

  return Recurso;
};
