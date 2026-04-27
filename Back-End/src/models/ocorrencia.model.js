import { DataTypes } from "sequelize";

const OcorrenciaModel = (sequelize) =>
  sequelize.define(
    "Ocorrencia",
    {
      idOcorrencia: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      foto: {
        type: DataTypes.STRING(255),
        allowNull: true,
      },
      descricao: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      localizacao: {
        type: DataTypes.STRING(255),
        allowNull: false,
      },
      dataOcorrencia: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      nomeAutor: {
        type: DataTypes.STRING(120),
        allowNull: false,
      },
      nrTelemovelAutor: {
        type: DataTypes.STRING(20),
        allowNull: false,
      },
      severidade: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      estado: {
        type: DataTypes.STRING(30),
        allowNull: false,
      },
      idCidadao: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idMunicipio: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idEquipa: {
        type: DataTypes.INTEGER,
        allowNull: true,
      },
      dataAgendada: {
        type: DataTypes.DATE,
        allowNull: true,
      },
      feedback: {
        type: DataTypes.TEXT,
        allowNull: true,
      },
      tipo_ocorrencia: {
        type: DataTypes.STRING(50),
        allowNull: false,
      },
      dataResolucao: {
        type: DataTypes.DATE,
        allowNull: true,
      },
    },
    {
      tableName: "ocorrencia",
      timestamps: false,
    },
  );

export default OcorrenciaModel;
