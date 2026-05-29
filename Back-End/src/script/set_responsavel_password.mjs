import "dotenv/config";
import bcrypt from "bcrypt";
import { sequelize, Trabalhador } from "../config/db.config.js";

const EMAIL = process.env.RESPONSAVEL_EMAIL || "responsavel.1@vcc.pt";
const PASSWORD = process.env.RESPONSAVEL_PASSWORD || "responsavelVCC";

async function setResponsavelPassword() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const transaction = await sequelize.transaction();
    try {
      const [updatedCount] = await Trabalhador.update(
        { credenciaisTrabalhadores: hashed },
        { where: { emailTrabalhador: EMAIL }, transaction },
      );

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Failed to set responsavel password:", err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
}

setResponsavelPassword();
