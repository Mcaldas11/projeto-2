-- MySQL Workbench Forward Engineering

SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0;
SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0;
SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='ONLY_FULL_GROUP_BY,STRICT_TRANS_TABLES,NO_ZERO_IN_DATE,NO_ZERO_DATE,ERROR_FOR_DIVISION_BY_ZERO,NO_ENGINE_SUBSTITUTION';

-- -----------------------------------------------------
-- Schema mydb
-- -----------------------------------------------------
-- -----------------------------------------------------
-- Schema projeto2
-- -----------------------------------------------------

-- -----------------------------------------------------
-- Schema projeto2
-- -----------------------------------------------------
CREATE SCHEMA IF NOT EXISTS `projeto2` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_0900_ai_ci ;
USE `projeto2` ;

-- -----------------------------------------------------
-- Table `projeto2`.`municipio`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`municipio` (
  `idMunicipio` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(120) NOT NULL,
  `responsavel` VARCHAR(120) NULL DEFAULT NULL,
  PRIMARY KEY (`idMunicipio`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `projeto2`.`cidadao`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`cidadao` (
  `idCidadao` INT NOT NULL AUTO_INCREMENT,
  `nome` VARCHAR(120) NOT NULL,
  `munCidadao` INT NULL DEFAULT NULL,
  `nrTelemovel` VARCHAR(20) NULL DEFAULT NULL,
  `email` VARCHAR(150) NOT NULL,
  PRIMARY KEY (`idCidadao`),
  UNIQUE INDEX `email` (`email` ASC) VISIBLE,
  INDEX `munCidadao` (`munCidadao` ASC) VISIBLE,
  CONSTRAINT `cidadao_ibfk_1`
    FOREIGN KEY (`munCidadao`)
    REFERENCES `projeto2`.`municipio` (`idMunicipio`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `projeto2`.`equipa`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`equipa` (
  `idEquipa` INT NOT NULL AUTO_INCREMENT,
  `especializacao` VARCHAR(150) NULL DEFAULT NULL,
  `munEquipa` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idEquipa`),
  INDEX `munEquipa` (`munEquipa` ASC) VISIBLE,
  CONSTRAINT `equipa_ibfk_1`
    FOREIGN KEY (`munEquipa`)
    REFERENCES `projeto2`.`municipio` (`idMunicipio`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `projeto2`.`ocorrencia`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`ocorrencia` (
  `idOcorrencia` INT NOT NULL AUTO_INCREMENT,
  `foto` VARCHAR(255) NULL DEFAULT NULL,
  `descricao` TEXT NULL DEFAULT NULL,
  `localizacao` VARCHAR(255) NULL DEFAULT NULL,
  `dataOcorrencia` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `nomeAutor` VARCHAR(120) NULL DEFAULT NULL,
  `nrTelemovelAutor` VARCHAR(20) NULL DEFAULT NULL,
  `severidade` ENUM('Baixa', 'Média', 'Alta') NULL DEFAULT NULL,
  `estado` ENUM('À espera de equipa', 'Em resolução', 'Resolvido', 'Não resolvido') NOT NULL DEFAULT 'À espera de equipa',
  `idCidadao` INT NULL DEFAULT NULL,
  `idMunicipio` INT NOT NULL,
  `idEquipa` INT NULL DEFAULT NULL,
  `dataAgendada` DATETIME NULL DEFAULT NULL,
  `feedback` TEXT NULL DEFAULT NULL,
  `tipo_ocorrencia` VARCHAR(50) NULL DEFAULT NULL,
  `dataResolucao` DATETIME NULL DEFAULT NULL,
  PRIMARY KEY (`idOcorrencia`),
  INDEX `idCidadao` (`idCidadao` ASC) VISIBLE,
  INDEX `idMunicipio` (`idMunicipio` ASC) VISIBLE,
  INDEX `idEquipa` (`idEquipa` ASC) VISIBLE,
  CONSTRAINT `ocorrencia_ibfk_1`
    FOREIGN KEY (`idCidadao`)
    REFERENCES `projeto2`.`cidadao` (`idCidadao`),
  CONSTRAINT `ocorrencia_ibfk_2`
    FOREIGN KEY (`idMunicipio`)
    REFERENCES `projeto2`.`municipio` (`idMunicipio`),
  CONSTRAINT `ocorrencia_ibfk_3`
    FOREIGN KEY (`idEquipa`)
    REFERENCES `projeto2`.`equipa` (`idEquipa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `projeto2`.`mensagem`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`mensagem` (
  `idMensagem` INT NOT NULL AUTO_INCREMENT,
  `texto` TEXT NULL DEFAULT NULL,
  `dataMensagem` DATETIME NULL DEFAULT CURRENT_TIMESTAMP,
  `classificacao` TINYINT NULL DEFAULT NULL,
  `idCidadao` INT NOT NULL,
  `idOcorrencia` INT NOT NULL,
  PRIMARY KEY (`idMensagem`),
  INDEX `idCidadao` (`idCidadao` ASC) VISIBLE,
  INDEX `idOcorrencia` (`idOcorrencia` ASC) VISIBLE,
  CONSTRAINT `mensagem_ibfk_1`
    FOREIGN KEY (`idCidadao`)
    REFERENCES `projeto2`.`cidadao` (`idCidadao`),
  CONSTRAINT `mensagem_ibfk_2`
    FOREIGN KEY (`idOcorrencia`)
    REFERENCES `projeto2`.`ocorrencia` (`idOcorrencia`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `projeto2`.`recurso`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`recurso` (
  `idRecurso` INT NOT NULL AUTO_INCREMENT,
  `tipo` VARCHAR(106) NULL DEFAULT NULL,
  `estado` VARCHAR(50) NULL DEFAULT NULL,
  `especificacoes` TEXT NULL DEFAULT NULL,
  `localizacao` VARCHAR(255) NULL DEFAULT NULL,
  `equipaResponsavel` INT NULL DEFAULT NULL,
  PRIMARY KEY (`idRecurso`),
  INDEX `equipaResponsavel` (`equipaResponsavel` ASC) VISIBLE,
  CONSTRAINT `recurso_ibfk_1`
    FOREIGN KEY (`equipaResponsavel`)
    REFERENCES `projeto2`.`equipa` (`idEquipa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


-- -----------------------------------------------------
-- Table `projeto2`.`trabalhador`
-- -----------------------------------------------------
CREATE TABLE IF NOT EXISTS `projeto2`.`trabalhador` (
  `idTrabalhador` INT NOT NULL AUTO_INCREMENT,
  `nomeTrabalhador` VARCHAR(120) NOT NULL,
  `emailTrabalhador` VARCHAR(150) NOT NULL,
  `telemovelTrabalhador` VARCHAR(20) NULL DEFAULT NULL,
  `idEquipa` INT NULL DEFAULT NULL,
  `credenciaisTrabalhadores` TEXT NULL DEFAULT NULL,
  PRIMARY KEY (`idTrabalhador`),
  UNIQUE INDEX `emailTrabalhador` (`emailTrabalhador` ASC) VISIBLE,
  INDEX `idEquipa` (`idEquipa` ASC) VISIBLE,
  CONSTRAINT `trabalhador_ibfk_1`
    FOREIGN KEY (`idEquipa`)
    REFERENCES `projeto2`.`equipa` (`idEquipa`))
ENGINE = InnoDB
DEFAULT CHARACTER SET = utf8mb4
COLLATE = utf8mb4_0900_ai_ci;


SET SQL_MODE=@OLD_SQL_MODE;
SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS;
SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS;
