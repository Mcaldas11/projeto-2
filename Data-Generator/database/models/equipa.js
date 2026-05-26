// equipa.js
module.exports = (sequelize, DataTypes) => {
  const Equipa = sequelize.define(
    "Equipa",
    {
      idEquipa: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      especializacao: { type: DataTypes.STRING(150), allowNull: true },
      fregEquipa: { type: DataTypes.INTEGER, allowNull: true },
    },
    {
      tableName: "equipa",
      timestamps: false,
    },
  );

  Equipa.associate = (models) => {
    Equipa.belongsTo(models.Municipio, { foreignKey: "fregEquipa" });
    Equipa.hasMany(models.Trabalhador, { foreignKey: "idEquipa" });
    Equipa.hasMany(models.Recurso, { foreignKey: "equipaResponsavel" });
    Equipa.hasMany(models.Ocorrencia, { foreignKey: "idEquipa" });
  };

  return Equipa;
};
