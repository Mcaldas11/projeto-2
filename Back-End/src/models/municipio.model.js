import { DataTypes } from "sequelize";

const MunicipioModel = (sequelize) =>
  sequelize.define(
    "Municipio",
    {
      idMunicipio: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      responsavel: {
        type: DataTypes.STRING(120),
        allowNull: true,
      },
    },
    {
      tableName: "municipio",
      timestamps: false,
    },
  );

export default MunicipioModel;
