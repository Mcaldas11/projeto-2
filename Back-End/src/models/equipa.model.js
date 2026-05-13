import { DataTypes } from "sequelize";

const EquipaModel = (sequelize) =>
  sequelize.define(
    "Equipa",
    {
      idEquipa: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      especializacao: {
        type: DataTypes.STRING(150),
        allowNull: false,
      },
      munEquipa: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "equipa",
      timestamps: false,
    },
  );

export default EquipaModel;
