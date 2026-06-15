import "dotenv/config";
import bcrypt from "bcrypt";
import { sequelize, Cidadao } from "../config/db.config.js";

const EMAIL = "rúben.soares@example.pt";
const PASSWORD = "Password123!";

async function setRubenPassword() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    await Cidadao.update(
      { credenciais: hashed },
      { where: { email: EMAIL } }
    );
    console.log(`Updated password for citizen: ${EMAIL}`);
  } catch (err) {
    console.error("Failed to set ruben password:", err);
  } finally {
    await sequelize.close();
  }
}

setRubenPassword();
