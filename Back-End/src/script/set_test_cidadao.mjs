import "dotenv/config";
import bcrypt from "bcrypt";
import { sequelize, Cidadao } from "../config/db.config.js";

const EMAIL = "test_cidadao@example.pt";
const PASSWORD = "Password123!";

async function setCidadaoPassword() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);

    const transaction = await sequelize.transaction();
    try {
      // Find a citizen to update or create one if needed (for simplicity we update one)
      const citizen = await Cidadao.findOne({ where: { email: EMAIL } });
      if (citizen) {
        await Cidadao.update(
          { credenciais: hashed },
          { where: { email: EMAIL }, transaction },
        );
        console.log(`Updated password for citizen: ${EMAIL}`);
      } else {
        // If not found, we could create one, but let's assume we use an existing one or just skip
        console.log(`Citizen ${EMAIL} not found. Please register manually or via script.`);
      }

      await transaction.commit();
    } catch (err) {
      await transaction.rollback();
      throw err;
    }
  } catch (err) {
    console.error("Failed to set citizen password:", err);
    process.exit(1);
  } finally {
    try {
      await sequelize.close();
    } catch {}
  }
}

setCidadaoPassword();
