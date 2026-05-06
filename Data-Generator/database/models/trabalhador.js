// trabalhador.js
module.exports = (sequelize, DataTypes) => {
  const Trabalhador = sequelize.define('Trabalhador', {
    idTrabalhador: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    nomeTrabalhador: { type: DataTypes.STRING(120), allowNull: false },
    emailTrabalhador: { type: DataTypes.STRING(150), allowNull: false, unique: true },
    telemovelTrabalhador: { type: DataTypes.STRING(20), allowNull: true },
    idEquipa: { type: DataTypes.INTEGER, allowNull: true },
    credenciaisTrabalhadores: { type: DataTypes.TEXT, allowNull: true },
  }, {
    tableName: 'trabalhador',
    timestamps: false,
  });

  Trabalhador.associate = (models) => {
    Trabalhador.belongsTo(models.Equipa, { foreignKey: 'idEquipa' });
  };

  return Trabalhador;
};
