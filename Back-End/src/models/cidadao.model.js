import { DataTypes } from "sequelize";

const CidadaoModel = (sequelize) =>
  sequelize.define(
    "Cidadao",
    {
      idCidadao: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      munCidadao: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      nrTelemovel: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          isEmail: true,
        },
      },
    },
    {
      tableName: "cidadao",
      timestamps: false,
    },
  );

export default CidadaoModel;
