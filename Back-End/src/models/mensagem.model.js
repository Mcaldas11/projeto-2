import { DataTypes } from "sequelize";

const MensagemModel = (sequelize) =>
  sequelize.define(
    "Mensagem",
    {
      idMensagem: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      texto: {
        type: DataTypes.TEXT,
        allowNull: false,
      },
      dataMensagem: {
        type: DataTypes.DATE,
        allowNull: false,
      },
      classificacao: {
        type: DataTypes.TINYINT,
        allowNull: true,
      },
      idCidadao: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
      idOcorrencia: {
        type: DataTypes.INTEGER,
        allowNull: false,
      },
    },
    {
      tableName: "mensagem",
      timestamps: false,
    },
  );

export default MensagemModel;
