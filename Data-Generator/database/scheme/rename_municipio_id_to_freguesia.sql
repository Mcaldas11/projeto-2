USE `Grupo04`;

ALTER TABLE `cidadao` DROP FOREIGN KEY `cidadao_ibfk_1`;
ALTER TABLE `equipa` DROP FOREIGN KEY `equipa_ibfk_1`;
ALTER TABLE `ocorrencia` DROP FOREIGN KEY `ocorrencia_ibfk_2`;

ALTER TABLE `municipio`
  CHANGE COLUMN `idMunicipio` `idFreguesia` INT NOT NULL AUTO_INCREMENT;

ALTER TABLE `cidadao`
  ADD CONSTRAINT `cidadao_ibfk_1`
  FOREIGN KEY (`munCidadao`) REFERENCES `municipio` (`idFreguesia`);

ALTER TABLE `equipa`
  ADD CONSTRAINT `equipa_ibfk_1`
  FOREIGN KEY (`munEquipa`) REFERENCES `municipio` (`idFreguesia`);

ALTER TABLE `ocorrencia`
  ADD CONSTRAINT `ocorrencia_ibfk_2`
  FOREIGN KEY (`idMunicipio`) REFERENCES `municipio` (`idFreguesia`);
