import "dotenv/config";
import bcrypt from "bcrypt";
import { sequelize, Cidadao, Trabalhador } from "../config/db.config.js";

const PASSWORD = "Password123!";

async function setup() {
  try {
    const hashed = await bcrypt.hash(PASSWORD, 10);
    
    // Ensure test citizen exists and has password
    await Cidadao.update(
      { credenciais: hashed },
      { where: { email: "test_cidadao@example.pt" } }
    );
    console.log("Updated test_cidadao password.");

    // Ensure worker 1 has password and is assigned to team 1 (if possible)
    // responsavel.1@vcc.pt / responsavelVCC is the default from seed, but let's make it Password123! to be sure
    await Trabalhador.update(
      { password: hashed },
      { where: { emailTrabalhador: "responsavel.1@vcc.pt" } }
    );
    // Ensure admin password
    await Trabalhador.update(
      { password: hashed },
      { where: { emailTrabalhador: "admin@vcc.pt" } }
    );
    // Ensure team 1 exists in Vila do Conde
    const [team] = await sequelize.query("SELECT idEquipa FROM equipa WHERE idEquipa = 1");
    if (!team.length) {
      await sequelize.query("INSERT INTO equipa (idEquipa, especializacao, fregEquipa) VALUES (1, 'Equipa 1', 1)");
      console.log("Created team 1.");
    } else {
      await sequelize.query("UPDATE equipa SET fregEquipa = 1 WHERE idEquipa = 1");
      console.log("Updated team 1.");
    }

    // Ensure responsavel.1 has team 1
    await Trabalhador.update(
      { idEquipa: 1, idFreguesia: 1 },
      { where: { emailTrabalhador: "responsavel.1@vcc.pt" } }
    );
    console.log("Updated responsavel.1 team.");

    // Ensure there is at least one occurrence for team 1 or no team (waiting)
    await sequelize.query("UPDATE ocorrencia SET idEquipa = 1, estado = 'Em resolução' WHERE idOcorrencia = 1");
    console.log("Prepared occurrence 1 for resolution.");

  } catch (err) {
    console.error("Setup failed:", err);
  } finally {
    await sequelize.close();
  }
}

setup();
