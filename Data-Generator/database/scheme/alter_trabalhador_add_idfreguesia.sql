-- Add municipality link to trabalhador for responsaveis.
ALTER TABLE `Grupo04`.`trabalhador`
  ADD COLUMN `idFreguesia` INT NULL DEFAULT NULL AFTER `idEquipa`,
  ADD INDEX `idFreguesia` (`idFreguesia` ASC) VISIBLE,
  ADD CONSTRAINT `trabalhador_ibfk_2`
    FOREIGN KEY (`idFreguesia`)
    REFERENCES `Grupo04`.`municipio` (`idFreguesia`);
