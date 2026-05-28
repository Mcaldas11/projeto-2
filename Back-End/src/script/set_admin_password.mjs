/*
  Script to set or create admin worker with password 'adminVCC'.
  Usage: node Back-End/src/script/set_admin_password.mjs
*/
import "dotenv/config";
import bcrypt from "bcrypt";
import { sequelize, Trabalhador } from "../config/db.config.js";

const EMAIL = process.env.ADMIN_EMAIL || "admin@vcc.pt";
const PASSWORD = process.env.ADMIN_PASSWORD || "adminVCC";

async function setAdminPassword() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const transaction = await sequelize.transaction();
    try {
      const [updatedCount] = await Trabalhador.update(
        { credenciaisTrabalhadores: hashed },
        { where: { emailTrabalhador: EMAIL }, transaction },
      );

      if (updatedCount === 0) {
        // create admin if not exists
        await Trabalhador.create(
          {
            nomeTrabalhador: "Admin",
            emailTrabalhador: EMAIL,
            telemovelTrabalhador: "000000000",
            idEquipa: null,
            idFreguesia: null,
            credenciaisTrabalhadores: hashed,
          },
          { transaction },
        );
        console.log(`Admin created with email ${EMAIL}`);
      } else {
        console.log(`Admin password updated for ${EMAIL}`);
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Failed to set admin password:", err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
}

setAdminPassword();
