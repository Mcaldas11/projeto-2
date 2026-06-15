import "dotenv/config";
import bcrypt from "bcrypt";
import { sequelize, Cidadao, Trabalhador, Equipa, Ocorrencia, Rota, Mensagem } from "../config/db.config.js";
import { Op } from "sequelize";

const PASSWORD = "Password123!";
const TEST_SUFFIX = "_e2e_test";

/**
 * Creates or updates dedicated test data with a recognizable suffix.
 */
async function setup() {
  try {
    console.log("Starting E2E Test Data Setup...");
    const hashed = await bcrypt.hash(PASSWORD, 10);

    // 1. Test Citizen
    const [cidadao] = await Cidadao.findOrCreate({
      where: { email: `test_cidadao${TEST_SUFFIX}@example.pt` },
      defaults: {
        nome: `Test Citizen ${TEST_SUFFIX}`,
        nrTelemovel: "910000000",
        fregCidadao: 1, // Assumes Vila do Conde freguesia exists
        credenciais: hashed
      }
    });
    console.log(`Citizen created/found: ${cidadao.email}`);

    // 2. Test Team
    const [team] = await Equipa.findOrCreate({
      where: { especializacao: `Equipa Teste ${TEST_SUFFIX}` },
      defaults: {
        fregEquipa: 1
      }
    });
    console.log(`Team created/found: ID ${team.idEquipa}`);

    // 3. Test Responsavel (Worker)
    const [responsavel] = await Trabalhador.findOrCreate({
      where: { emailTrabalhador: `responsavel.${TEST_SUFFIX}@vcc.pt` },
      defaults: {
        nomeTrabalhador: `Responsavel Teste ${TEST_SUFFIX}`,
        telemovelTrabalhador: "910000001",
        credenciaisTrabalhadores: hashed,
        idFreguesia: 1,
        idEquipa: team.idEquipa
      }
    });
    // Force update team ID in case the record was reused from a previous run with a different team ID
    await responsavel.update({ idEquipa: team.idEquipa });
    console.log(`Responsavel created/found: ${responsavel.emailTrabalhador}`);

    // 4. Test Admin
    const [admin] = await Trabalhador.findOrCreate({
      where: { emailTrabalhador: `admin${TEST_SUFFIX}@vcc.pt` },
      defaults: {
        nomeTrabalhador: `Admin Teste ${TEST_SUFFIX}`,
        telemovelTrabalhador: "910000002",
        credenciaisTrabalhadores: hashed,
        idFreguesia: 1
      }
    });
    console.log(`Admin created/found: ${admin.emailTrabalhador}`);

    // 5. Test Occurrence
    const [ocorrencia] = await Ocorrencia.findOrCreate({
      where: { descricao: { [Op.like]: `%${TEST_SUFFIX}%` } },
      defaults: {
        descricao: `Ocorrência de teste ${TEST_SUFFIX}`,
        localizacao: "Vila do Conde",
        dataOcorrencia: new Date(),
        nomeAutor: cidadao.nome,
        nrTelemovelAutor: cidadao.nrTelemovel,
        severidade: "Média",
        estado: "À espera da equipa",
        idCidadao: cidadao.idCidadao,
        idFreguesia: 1,
        idEquipa: team.idEquipa,
        tipo_ocorrencia: "Iluminação"
      }
    });
    
    // Force update to ensure it has the current test team and correct state
    await ocorrencia.update({
      idEquipa: team.idEquipa,
      estado: "À espera da equipa"
    });
    console.log(`Occurrence created/found: ID ${ocorrencia.idOcorrencia}`);

    console.log("E2E Test Data Setup completed successfully.");
  } catch (err) {
    console.error("Setup failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

/**
 * Deletes all data created with the TEST_SUFFIX.
 * This ensures no pollution remains in the database.
 */
async function teardown() {
  try {
    console.log("Starting E2E Test Data Teardown...");

    // Order matters due to foreign keys if they are not ON DELETE CASCADE
    
    // 1. Delete Messages
    const deletedMessages = await Mensagem.destroy({
      where: {
        [Op.or]: [
          { idCidadao: { [Op.in]: sequelize.literal(`(SELECT idCidadao FROM cidadao WHERE email LIKE '%${TEST_SUFFIX}%')`) } },
          { idOcorrencia: { [Op.in]: sequelize.literal(`(SELECT idOcorrencia FROM ocorrencia WHERE descricao LIKE '%${TEST_SUFFIX}%')`) } }
        ]
      }
    });
    console.log(`Deleted ${deletedMessages} test messages.`);

    // 2. Delete Rotas
    const deletedRotas = await Rota.destroy({
      where: { nome: { [Op.like]: `%${TEST_SUFFIX}%` } }
    });
    console.log(`Deleted ${deletedRotas} test rotas.`);

    // 3. Delete Ocorrencias
    const deletedOcorrencias = await Ocorrencia.destroy({
      where: { descricao: { [Op.like]: `%${TEST_SUFFIX}%` } }
    });
    console.log(`Deleted ${deletedOcorrencias} test occurrences.`);

    // 4. Delete Workers (Trabalhadores)
    const deletedWorkers = await Trabalhador.destroy({
      where: { emailTrabalhador: { [Op.like]: `%${TEST_SUFFIX}%` } }
    });
    console.log(`Deleted ${deletedWorkers} test workers.`);

    // 5. Delete Teams (Equipas)
    const deletedTeams = await Equipa.destroy({
      where: { especializacao: { [Op.like]: `%${TEST_SUFFIX}%` } }
    });
    console.log(`Deleted ${deletedTeams} test teams.`);

    // 6. Delete Citizens (Cidadaos)
    const deletedCitizens = await Cidadao.destroy({
      where: { email: { [Op.like]: `%${TEST_SUFFIX}%` } }
    });
    console.log(`Deleted ${deletedCitizens} test citizens.`);

    console.log("E2E Test Data Teardown completed successfully.");
  } catch (err) {
    console.error("Teardown failed:", err);
    process.exit(1);
  } finally {
    await sequelize.close();
  }
}

// Check command line arguments
const action = process.argv[2];
if (action === "setup") {
  setup();
} else if (action === "teardown") {
  teardown();
} else {
  console.log("Usage: node setup_test_data.mjs [setup|teardown]");
  process.exit(1);
}
