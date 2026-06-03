import { sequelize, Trabalhador, Equipa } from "../config/db.config.js";
import { Op } from "sequelize";

const run = async () => {
  try {
    await sequelize.authenticate();
    console.log("Connected to database");

    const workers = await Trabalhador.findAll({
      where: {
        idEquipa: { [Op.not]: null },
        [Op.or]: [{ idFreguesia: null }, { idFreguesia: 0 }],
      },
    });

    console.log(
      `Found ${workers.length} workers that may need freguesia assigned`,
    );

    let updated = 0;

    for (const w of workers) {
      const teamId = w.idEquipa;
      if (!teamId) continue;

      const team = await Equipa.findByPk(teamId);
      if (!team) {
        console.warn(`Worker ${w.idTrabalhador}: team ${teamId} not found`);
        continue;
      }

      const teamFreg = Number(team.fregEquipa);
      if (!Number.isInteger(teamFreg) || teamFreg <= 0) {
        console.warn(
          `Team ${teamId} has invalid fregEquipa: ${team.fregEquipa}`,
        );
        continue;
      }

      // Update only if worker has no freguesia or different
      if (!w.idFreguesia || Number(w.idFreguesia) !== teamFreg) {
        await w.update({ idFreguesia: teamFreg });
        updated++;
        console.log(
          `Updated worker ${w.idTrabalhador} -> idFreguesia=${teamFreg}`,
        );
      }
    }

    console.log(`Finished. Updated ${updated} workers.`);
    process.exit(0);
  } catch (err) {
    console.error("Error updating workers freguesia:", err);
    process.exit(1);
  }
};

run();
