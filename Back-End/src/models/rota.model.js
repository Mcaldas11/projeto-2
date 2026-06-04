import { DataTypes } from "sequelize";

const RotaModel = (sequelize) =>
  sequelize.define(
    "Rota",
    {
      idRota: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      nome: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      idFreguesia: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      waypoints: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      geometry: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      cor: {
        type: DataTypes.STRING(20),
        allowNull: true,
      },
    },
    {
      tableName: "rota",
      timestamps: false,
    },
  );

export default RotaModel;
