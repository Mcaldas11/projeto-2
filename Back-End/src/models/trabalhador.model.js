import { DataTypes } from "sequelize";

const TrabalhadorModel = (sequelize) =>
  sequelize.define(
    "Trabalhador",
    {
      idTrabalhador: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nomeTrabalhador: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      emailTrabalhador: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
      telemovelTrabalhador: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      idEquipa: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      credenciaisTrabalhadores: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
    },
    {
      tableName: "trabalhador",
      timestamps: false,
    },
  );

export default TrabalhadorModel;
