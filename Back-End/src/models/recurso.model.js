import { DataTypes } from "sequelize";

const RecursoModel = (sequelize) =>
  sequelize.define(
    "Recurso",
    {
      idRecurso: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      tipo: {
        type: DataTypes.STRING(106),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      especificacoes: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      localizacao: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      equipaResponsavel: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "recurso",
      timestamps: false,
    },
  );

export default RecursoModel;
