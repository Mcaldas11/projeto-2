import "dotenv/config";
import bcrypt from "bcrypt";
import { Op } from "sequelize";
import { sequelize, Trabalhador } from "../config/db.config.js";

const PASSWORD = process.env.RESPONSAVEL_PASSWORD || "responsavelVCC";

async function setResponsavelPassword() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const transaction = await sequelize.transaction();
    try {
      const where = { emailTrabalhador: { [Op.like]: "responsavel.%" } };
      const [updatedCount] = await Trabalhador.update(
        { credenciaisTrabalhadores: hashed },
        { where, transaction },
      );

      console.log(`Updated ${updatedCount} responsavel(s) password.`);

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
