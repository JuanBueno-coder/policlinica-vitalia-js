




SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;



-- Tablas auxiliares 

CREATE TABLE `plantas` (
  `id_planta`     INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`        VARCHAR(60)  NOT NULL,
  `numero`        TINYINT      NOT NULL,
  `accesible`     BOOLEAN      NOT NULL DEFAULT TRUE,
  `fecha_reforma` DATE         NOT NULL,
  PRIMARY KEY (`id_planta`),
  UNIQUE KEY `uk_plantas_nombre` (`nombre`)
) ENGINE=InnoDB;

CREATE TABLE `aseguradoras` (
  `id_aseguradora`  INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`          VARCHAR(60)  NOT NULL,
  `copago`          DECIMAL(6,2) NOT NULL DEFAULT 0,
  `cobertura_total` BOOLEAN      NOT NULL DEFAULT FALSE,
  `fecha_convenio`  DATE         NOT NULL,
  PRIMARY KEY (`id_aseguradora`),
  UNIQUE KEY `uk_aseguradoras_nombre` (`nombre`)
) ENGINE=InnoDB;


-- Tablas principales

CREATE TABLE `especialidades` (
  `id_especialidad` INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`          VARCHAR(60)  NOT NULL,
  `num_consultas`   TINYINT UNSIGNED NOT NULL DEFAULT 1,
  `activa`          BOOLEAN      NOT NULL DEFAULT TRUE,
  `fecha_apertura`  DATE         NOT NULL,
  `id_planta`       INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_especialidad`),
  UNIQUE KEY `uk_especialidades_nombre` (`nombre`),
  CONSTRAINT `fk_especialidades_plantas` FOREIGN KEY (`id_planta`)
    REFERENCES `plantas` (`id_planta`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `medicos` (
  `id_medico`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`            VARCHAR(100) NOT NULL,
  `num_colegiado`     VARCHAR(20)  NOT NULL,
  `turno`             VARCHAR(10)  NOT NULL,
  `anios_experiencia` TINYINT UNSIGNED NOT NULL DEFAULT 0,
  `en_activo`         BOOLEAN      NOT NULL DEFAULT TRUE,
  `fecha_alta`        DATE         NOT NULL,
  `id_especialidad`   INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_medico`),
  UNIQUE KEY `uk_medicos_colegiado` (`num_colegiado`),
  CONSTRAINT `fk_medicos_especialidades` FOREIGN KEY (`id_especialidad`)
    REFERENCES `especialidades` (`id_especialidad`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `pacientes` (
  `id_paciente`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `nombre`           VARCHAR(100) NOT NULL,
  `dni`              CHAR(9)      NOT NULL,
  `telefono`         VARCHAR(15)  NOT NULL,
  `peso_kg`          DECIMAL(5,2) NOT NULL,
  `recordatorio_sms` BOOLEAN      NOT NULL DEFAULT TRUE,
  `fecha_nacimiento` DATE         NOT NULL,
  `id_aseguradora`   INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_paciente`),
  UNIQUE KEY `uk_pacientes_dni` (`dni`),
  CONSTRAINT `fk_pacientes_aseguradoras` FOREIGN KEY (`id_aseguradora`)
    REFERENCES `aseguradoras` (`id_aseguradora`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `citas` (
  `id_cita`      INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `fecha_hora`   DATETIME     NOT NULL,
  `motivo`       VARCHAR(255) NOT NULL,
  `duracion_min` SMALLINT UNSIGNED NOT NULL DEFAULT 15,
  `atendida`     BOOLEAN      NOT NULL DEFAULT FALSE,
  `id_medico`    INT UNSIGNED NOT NULL,
  `id_paciente`  INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_cita`),
  CONSTRAINT `fk_citas_medicos` FOREIGN KEY (`id_medico`)
    REFERENCES `medicos` (`id_medico`) ON UPDATE CASCADE ON DELETE RESTRICT,
  CONSTRAINT `fk_citas_pacientes` FOREIGN KEY (`id_paciente`)
    REFERENCES `pacientes` (`id_paciente`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

CREATE TABLE `pruebas` (
  `id_prueba`         INT UNSIGNED NOT NULL AUTO_INCREMENT,
  `tipo`              VARCHAR(80)  NOT NULL,
  `resultado`         VARCHAR(255) NOT NULL,
  `fecha_realizacion` DATE         NOT NULL,
  `coste`             DECIMAL(7,2) NOT NULL,
  `urgente`           BOOLEAN      NOT NULL DEFAULT FALSE,
  `id_cita`           INT UNSIGNED NOT NULL,
  PRIMARY KEY (`id_prueba`),
  CONSTRAINT `fk_pruebas_citas` FOREIGN KEY (`id_cita`)
    REFERENCES `citas` (`id_cita`) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE=InnoDB;

-- Datos

INSERT INTO `plantas` (`nombre`, `numero`, `accesible`, `fecha_reforma`) VALUES
  ('Sótano · Laboratorio', -1, 1, '2021-03-15'),
  ('Planta baja · Ala norte', 0, 1, '2023-06-01'),
  ('Planta baja · Ala sur', 0, 1, '2023-06-01'),
  ('Planta 1 · Ala norte', 1, 1, '2022-09-12'),
  ('Planta 1 · Ala sur', 1, 1, '2022-09-12'),
  ('Planta 2 · Ala norte', 2, 1, '2020-01-20'),
  ('Planta 2 · Ala sur', 2, 0, '2015-04-08'),
  ('Planta 3 · Ala norte', 3, 1, '2024-02-26'),
  ('Planta 3 · Ala sur', 3, 0, '2016-11-30'),
  ('Planta 4 · Dirección', 4, 1, '2019-07-15');

INSERT INTO `aseguradoras` (`nombre`, `copago`, `cobertura_total`, `fecha_convenio`) VALUES
  ('Sin aseguradora (particular)', 0.0, 0, '2010-01-01'),
  ('Salud Cerca', 0.0, 1, '2012-05-10'),
  ('Medicor', 0.0, 1, '2014-02-01'),
  ('Previsora Sur', 5.0, 0, '2015-09-15'),
  ('Bienestar Total', 8.0, 0, '2017-03-01'),
  ('Mutua Horizonte', 3.5, 0, '2018-11-20'),
  ('Seguros Alameda', 6.0, 0, '2019-06-03'),
  ('Vida Plena', 0.0, 1, '2020-10-12'),
  ('Protección Familiar', 4.0, 0, '2022-01-17'),
  ('Sanus Mutua', 2.5, 1, '2023-04-24');

INSERT INTO `especialidades` (`nombre`, `num_consultas`, `activa`, `fecha_apertura`, `id_planta`) VALUES
  ('Medicina general', 6, 1, '2010-01-15', 2),
  ('Cardiología', 3, 1, '2024-03-01', 4),
  ('Pediatría', 4, 1, '2011-09-05', 5),
  ('Dermatología', 2, 1, '2013-02-18', 6),
  ('Traumatología', 4, 1, '2010-01-15', 3),
  ('Oftalmología', 3, 1, '2014-10-20', 6),
  ('Ginecología', 2, 1, '2012-04-11', 5),
  ('Neumología', 2, 1, '2018-06-25', 8),
  ('Otorrinolaringología', 2, 1, '2016-01-12', 8),
  ('Radiología', 3, 1, '2010-01-15', 1),
  ('Neurología', 1, 0, '2021-05-03', 7);

INSERT INTO `medicos` (`nombre`, `num_colegiado`, `turno`, `anios_experiencia`, `en_activo`, `fecha_alta`, `id_especialidad`) VALUES
  ('Dra. Elena Martos Ruiz', '41/2804512', 'Mañana', 12, 1, '2024-03-01', 2),
  ('Dra. Lucía Ferrer Gil', '41/2507741', 'Mañana', 9, 1, '2017-09-04', 3),
  ('Dr. Samuel Okafor Díaz', '41/2201986', 'Tarde', 15, 1, '2013-02-18', 4),
  ('Dr. Andrés Molina Castro', '41/1903377', 'Mañana', 21, 1, '2010-01-15', 5),
  ('Dra. Aisha Benali Torres', '41/2109653', 'Tarde', 11, 1, '2016-05-09', 7),
  ('Dr. Ramón Ibarra Soto', '41/1504420', 'Tarde', 27, 1, '2014-10-20', 6),
  ('Dra. Marta Celis Navarro', '41/2606118', 'Mañana', 7, 1, '2019-01-14', 1),
  ('Dr. Javier Pozo Arenas', '41/2002875', 'Tarde', 18, 1, '2011-11-02', 1),
  ('Dra. Inés Varela Prieto', '41/2405532', 'Mañana', 10, 1, '2018-06-25', 8),
  ('Dr. Tomás Requena Lima', '41/1806240', 'Tarde', 22, 1, '2016-01-12', 9),
  ('Dra. Carmen Salas Ortega', '41/2303397', 'Mañana', 14, 1, '2012-03-19', 10),
  ('Dr. Hugo Lozano Fuentes', '41/2701164', 'Tarde', 4, 0, '2021-05-03', 11);

INSERT INTO `pacientes` (`nombre`, `dni`, `telefono`, `peso_kg`, `recordatorio_sms`, `fecha_nacimiento`, `id_aseguradora`) VALUES
  ('Ana García López', '48211503F', '600123456', 61.5, 1, '1988-04-12', 3),
  ('Manuel Rodríguez Peña', '28411076G', '611234567', 82.3, 0, '1962-11-03', 2),
  ('Lucía Fernández Gómez', '77812340M', '622345678', 54.0, 1, '1995-07-21', 1),
  ('Pablo Jiménez Ruiz', '30122987W', '633456789', 90.1, 1, '1979-02-08', 4),
  ('Carmen Moreno Díaz', '52300418M', '644567890', 68.7, 0, '1970-09-30', 5),
  ('Daniel Álvarez Romero', '49001256D', '655678901', 25.4, 1, '2017-05-16', 2),
  ('Sara Muñoz Navarro', '29877410L', '666789012', 59.8, 1, '1991-12-02', 8),
  ('Javier Torres Gil', '45129803P', '677890123', 77.0, 0, '1984-03-27', 6),
  ('Elena Serrano Molina', '31560092K', '688901234', 63.2, 1, '1958-08-14', 10),
  ('Alberto Castro Ortiz', '53998127S', '699012345', 85.6, 0, '1966-01-19', 7),
  ('Marina Rubio Marín', '47230671X', '612301234', 18.9, 1, '2020-10-05', 9),
  ('Rafael Sanz Iglesias', '28760345H', '623412345', 74.4, 1, '1949-06-11', 1);

INSERT INTO `citas` (`fecha_hora`, `motivo`, `duracion_min`, `atendida`, `id_medico`, `id_paciente`) VALUES
  ('2026-10-05 09:00:00', 'Revisión anual con electrocardiograma', 20, 1, 1, 2),
  ('2026-10-06 10:30:00', 'Control del niño sano', 15, 1, 2, 6),
  ('2026-10-08 17:00:00', 'Revisión de lunares', 15, 1, 3, 7),
  ('2026-10-13 09:30:00', 'Dolor de rodilla tras caída', 20, 1, 4, 4),
  ('2026-10-15 18:15:00', 'Revisión ginecológica anual', 30, 1, 5, 3),
  ('2026-10-20 16:45:00', 'Pérdida de visión de cerca', 20, 1, 6, 9),
  ('2026-10-22 08:30:00', 'Fiebre y malestar general', 10, 1, 7, 1),
  ('2026-10-27 19:00:00', 'Tos persistente', 15, 1, 8, 10),
  ('2026-11-03 11:00:00', 'Dificultad para respirar al esfuerzo', 20, 1, 9, 12),
  ('2026-11-05 17:30:00', 'Otitis recurrente', 15, 1, 10, 11),
  ('2026-11-10 10:00:00', 'Seguimiento de hipertensión', 20, 1, 1, 5),
  ('2026-11-24 09:15:00', 'Dolor lumbar', 20, 0, 4, 8),
  ('2026-11-25 12:00:00', 'Vacunación y revisión', 15, 0, 2, 11),
  ('2026-11-26 18:00:00', 'Revisión de dermatitis', 15, 0, 3, 3),
  ('2026-12-01 09:45:00', 'Palpitaciones', 20, 0, 1, 10);

INSERT INTO `pruebas` (`tipo`, `resultado`, `fecha_realizacion`, `coste`, `urgente`, `id_cita`) VALUES
  ('Electrocardiograma', 'Ritmo sinusal normal', '2026-10-05', 35.0, 0, 1),
  ('Analítica de sangre', 'Colesterol LDL ligeramente elevado', '2026-10-07', 30.0, 0, 1),
  ('Dermatoscopia', 'Lesión benigna, control en un año', '2026-10-08', 45.0, 0, 3),
  ('Radiografía de rodilla', 'Sin fractura; derrame leve', '2026-10-13', 40.0, 1, 4),
  ('Resonancia magnética de rodilla', 'Rotura parcial del menisco interno', '2026-10-19', 220.0, 0, 4),
  ('Ecografía ginecológica', 'Sin hallazgos patológicos', '2026-10-15', 80.0, 0, 5),
  ('Tonometría ocular', 'Presión intraocular normal', '2026-10-20', 25.0, 0, 6),
  ('Analítica de sangre', 'Leucocitosis leve', '2026-10-22', 30.0, 1, 7),
  ('Radiografía de tórax', 'Sin condensaciones', '2026-10-28', 40.0, 0, 8),
  ('Espirometría', 'Patrón obstructivo leve', '2026-11-03', 55.0, 0, 9),
  ('Audiometría', 'Hipoacusia leve en oído derecho', '2026-11-05', 50.0, 0, 10),
  ('Holter de 24 horas', 'Pendiente de resultados', '2026-11-11', 120.0, 0, 11),
  ('Ecocardiografía', 'Función ventricular conservada', '2026-11-12', 150.0, 0, 11),
  ('Analítica de orina', 'Pendiente de resultados', '2026-11-24', 15.0, 0, 12),
  ('Prueba de esfuerzo', 'Pendiente de resultados', '2026-12-02', 180.0, 1, 15);

SET FOREIGN_KEY_CHECKS = 1;
