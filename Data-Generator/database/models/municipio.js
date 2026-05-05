// municipio.js
module.exports = (sequelize, DataTypes) => {
  const Municipio = sequelize.define(
    "Municipio",
    {
      idMunicipio: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      nome: { type: DataTypes.STRING(120), allowNull: false },
      responsavel: { type: DataTypes.STRING(120), allowNull: true },
      freguesias: { type: DataTypes.JSON, allowNull: true },
    },
    {
      tableName: "municipio",
      timestamps: false,
    },
  );

  Municipio.associate = (models) => {
    Municipio.hasMany(models.Cidadao, { foreignKey: "munCidadao" });
    Municipio.hasMany(models.Equipa, { foreignKey: "munEquipa" });
    Municipio.hasMany(models.Ocorrencia, { foreignKey: "idMunicipio" });
  };

  return Municipio;
};
