CREATE DATABASE IF NOT EXISTS fpb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fpb_db;

-- ============================================================
-- DROP ALL TABLES (ordem inversa das foreign keys)
-- ============================================================
-- SET FOREIGN_KEY_CHECKS = 0;
-- DROP TABLE IF EXISTS AuditLog;
-- DROP TABLE IF EXISTS Document;
-- DROP TABLE IF EXISTS DocumentCategory;
-- DROP TABLE IF EXISTS Permission;
-- DROP TABLE IF EXISTS Administrator;
-- DROP TABLE IF EXISTS GameAthlete;
-- DROP TABLE IF EXISTS GameReferee;
-- DROP TABLE IF EXISTS Game;
-- DROP TABLE IF EXISTS CompetitionTeam;
-- DROP TABLE IF EXISTS Competition;
-- DROP TABLE IF EXISTS TeamAthlete;
-- DROP TABLE IF EXISTS CoachTeam;
-- DROP TABLE IF EXISTS Team;
-- DROP TABLE IF EXISTS Club;
-- DROP TABLE IF EXISTS FPBMember;
-- DROP TABLE IF EXISTS Coach;
-- DROP TABLE IF EXISTS Referee;
-- DROP TABLE IF EXISTS Athlete;
-- DROP TABLE IF EXISTS Person;
-- DROP TABLE IF EXISTS Association;
-- SET FOREIGN_KEY_CHECKS = 1;
-- ============================================================

-- ============================================================
-- ASSOCIATIONS (T4: Associacao)
-- ============================================================

CREATE TABLE Association (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL UNIQUE COMMENT 'Ex: Associação de Basquetebol do Porto',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- ============================================================
-- PERSONS & ROLES
-- ============================================================

CREATE TABLE Person (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    first_name  VARCHAR(100) NOT NULL,
    last_name   VARCHAR(100) NOT NULL,
    email       VARCHAR(255) UNIQUE,
    birth_date  DATE,
    nationality VARCHAR(100),
    photo_url   VARCHAR(500),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Athlete (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id   INT UNSIGNED NOT NULL UNIQUE,
    license_number VARCHAR(50) UNIQUE COMMENT 'T4: numero_licenca — número oficial FPB',
    position    ENUM('PG','SG','SF','PF','C') COMMENT 'Point Guard, Shooting Guard, Small Forward, Power Forward, Center',
    jersey_number TINYINT UNSIGNED,
    height_cm   SMALLINT UNSIGNED,
    weight_kg   DECIMAL(5,2),
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (person_id) REFERENCES Person(id) ON DELETE CASCADE
);

CREATE TABLE Referee (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id   INT UNSIGNED NOT NULL UNIQUE,
    license_number VARCHAR(50) UNIQUE,
    level       ENUM('national','regional','local') DEFAULT 'local' COMMENT 'T4: grau',
    type        ENUM('Árbitro','Oficial de Mesa') NOT NULL DEFAULT 'Árbitro' COMMENT 'T4: tipo',
    association_id INT UNSIGNED COMMENT 'T4: Juiz pertence a uma Associacao',
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (person_id) REFERENCES Person(id) ON DELETE CASCADE,
    FOREIGN KEY (association_id) REFERENCES Association(id) ON DELETE SET NULL
);

CREATE TABLE Coach (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id   INT UNSIGNED NOT NULL UNIQUE,
    license_number VARCHAR(50) UNIQUE,
    level       VARCHAR(50) COMMENT 'T4: nivel — Ex: Nível 1, Nível 2, Nível 3',
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (person_id) REFERENCES Person(id) ON DELETE CASCADE
);

CREATE TABLE FPBMember (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id   INT UNSIGNED NOT NULL UNIQUE,
    member_number VARCHAR(50) UNIQUE,
    role_description VARCHAR(200) COMMENT 'T4: cargo — Ex: Presidente, Secretário',
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (person_id) REFERENCES Person(id) ON DELETE CASCADE
);

-- ============================================================
-- CLUBS & TEAMS
-- ============================================================

CREATE TABLE Club (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL UNIQUE,
    short_name  VARCHAR(20),
    acronym     VARCHAR(10),
    city        VARCHAR(100),
    district    VARCHAR(100),
    association_id INT UNSIGNED COMMENT 'T4: Clube pertence a uma Associacao',
    founded_year YEAR,
    logo_url    VARCHAR(500),
    website     VARCHAR(500),
    email       VARCHAR(255),
    phone       VARCHAR(30),
    address     VARCHAR(500),
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (association_id) REFERENCES Association(id) ON DELETE SET NULL
);

-- T4: Equipa pertence a um Clube OU a uma Associacao (seleções distritais).
-- Ambas as FKs são nullable; a lógica de negócio garante que pelo menos uma existe.
CREATE TABLE Team (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    club_id     INT UNSIGNED,
    association_id INT UNSIGNED COMMENT 'T4: seleções distritais pertencem a uma Associacao',
    gender      ENUM('male','female','mixed') NOT NULL DEFAULT 'male',
    age_group   VARCHAR(50) COMMENT 'e.g. Seniores, Sub-20, Sub-16',
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES Club(id) ON DELETE SET NULL,
    FOREIGN KEY (association_id) REFERENCES Association(id) ON DELETE SET NULL
);

CREATE TABLE TeamAthlete (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    team_id     INT UNSIGNED NOT NULL,
    athlete_id  INT UNSIGNED NOT NULL,
    season      VARCHAR(9) NOT NULL COMMENT 'e.g. 2024/2025',
    jersey_number TINYINT UNSIGNED,
    joined_at   DATE,
    left_at     DATE,
    UNIQUE KEY uq_team_athlete_season (team_id, athlete_id, season),
    FOREIGN KEY (team_id) REFERENCES Team(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES Athlete(id) ON DELETE CASCADE
);

-- T4: TreinadorEquipa — um treinador treina N equipas e vice-versa (N:M)
CREATE TABLE CoachTeam (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    coach_id    INT UNSIGNED NOT NULL,
    team_id     INT UNSIGNED NOT NULL,
    UNIQUE KEY uq_coach_team (coach_id, team_id),
    FOREIGN KEY (coach_id) REFERENCES Coach(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES Team(id) ON DELETE CASCADE
);

-- ============================================================
-- COMPETITIONS
-- ============================================================

CREATE TABLE Competition (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    season      VARCHAR(9) NOT NULL COMMENT 'e.g. 2024/2025',
    gender      ENUM('male','female','mixed') NOT NULL DEFAULT 'male',
    age_group   VARCHAR(50),
    level       ENUM('national','regional','district') DEFAULT 'national',
    status      ENUM('scheduled','ongoing','finished','cancelled') DEFAULT 'scheduled',
    start_date  DATE,
    end_date    DATE,
    description TEXT,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE CompetitionTeam (
    id             INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    competition_id INT UNSIGNED NOT NULL,
    team_id        INT UNSIGNED NOT NULL,
    UNIQUE KEY uq_competition_team (competition_id, team_id),
    FOREIGN KEY (competition_id) REFERENCES Competition(id) ON DELETE CASCADE,
    FOREIGN KEY (team_id) REFERENCES Team(id) ON DELETE CASCADE
);

-- ============================================================
-- GAMES
-- ============================================================

CREATE TABLE Game (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    competition_id  INT UNSIGNED NOT NULL,
    home_team_id    INT UNSIGNED NOT NULL,
    away_team_id    INT UNSIGNED NOT NULL,
    game_date       DATETIME,
    venue           VARCHAR(200),
    round           VARCHAR(50) COMMENT 'e.g. Round 1, Quarter-Final',
    score_home      SMALLINT UNSIGNED,
    score_away      SMALLINT UNSIGNED,
    status          ENUM('Agendado','Em curso','Realizado','Adiado','Cancelado') DEFAULT 'Agendado',
    notes           TEXT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (competition_id) REFERENCES Competition(id) ON DELETE CASCADE,
    FOREIGN KEY (home_team_id) REFERENCES Team(id),
    FOREIGN KEY (away_team_id) REFERENCES Team(id),
    CHECK (home_team_id <> away_team_id)
);

CREATE TABLE GameReferee (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    game_id     INT UNSIGNED NOT NULL,
    referee_id  INT UNSIGNED NOT NULL,
    role        ENUM('main','assistant','table') DEFAULT 'main',
    UNIQUE KEY uq_game_referee (game_id, referee_id),
    FOREIGN KEY (game_id) REFERENCES Game(id) ON DELETE CASCADE,
    FOREIGN KEY (referee_id) REFERENCES Referee(id) ON DELETE CASCADE
);

-- T4: AtletaJogo — participação e estatísticas de um atleta num jogo.
-- Médias por temporada são calculadas dinamicamente a partir destes registos.
CREATE TABLE GameAthlete (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    game_id         INT UNSIGNED NOT NULL,
    athlete_id      INT UNSIGNED NOT NULL,
    points          SMALLINT UNSIGNED DEFAULT 0 COMMENT 'T4: pontos',
    rebounds        SMALLINT UNSIGNED DEFAULT 0 COMMENT 'T4: ressaltos',
    assists         SMALLINT UNSIGNED DEFAULT 0 COMMENT 'T4: assistencias',
    minutes_played  TINYINT UNSIGNED DEFAULT 0 COMMENT 'T4: minutos_jogados',
    UNIQUE KEY uq_game_athlete (game_id, athlete_id),
    FOREIGN KEY (game_id) REFERENCES Game(id) ON DELETE CASCADE,
    FOREIGN KEY (athlete_id) REFERENCES Athlete(id) ON DELETE CASCADE
);

-- ============================================================
-- ADMINISTRATORS & PERMISSIONS
-- ============================================================

CREATE TABLE Administrator (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    email       VARCHAR(255) NOT NULL UNIQUE,
    password    VARCHAR(255) NOT NULL COMMENT 'bcrypt hash',
    is_superadmin TINYINT(1) DEFAULT 0,
    is_active   TINYINT(1) DEFAULT 1,
    last_login  TIMESTAMP NULL,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Permission (
    id              INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id        INT UNSIGNED NOT NULL,
    area            ENUM('clubs','competitions','games','members','documents','administrators') NOT NULL,
    can_create      TINYINT(1) DEFAULT 0,
    can_edit        TINYINT(1) DEFAULT 0,
    can_delete      TINYINT(1) DEFAULT 0,
    UNIQUE KEY uq_admin_area (admin_id, area),
    FOREIGN KEY (admin_id) REFERENCES Administrator(id) ON DELETE CASCADE
);

-- ============================================================
-- DOCUMENTS (T4: CategoriaDocumento + Documento)
-- ============================================================

CREATE TABLE DocumentCategory (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE COMMENT 'Ex: Regulamento, Circular',
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Document (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    description TEXT,
    category_id INT UNSIGNED COMMENT 'T4: FK para CategoriaDocumento',
    published_date DATE COMMENT 'T4: data_publicacao',
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_size   INT UNSIGNED,
    mime_type   VARCHAR(100),
    uploaded_by INT UNSIGNED,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES DocumentCategory(id) ON DELETE SET NULL,
    FOREIGN KEY (uploaded_by) REFERENCES Administrator(id) ON DELETE SET NULL
);

-- ============================================================
-- AUDIT LOG
-- ============================================================

CREATE TABLE AuditLog (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id    INT UNSIGNED,
    admin_email VARCHAR(255),
    action      ENUM('CREATE','UPDATE','DELETE','LOGIN','LOGOUT') NOT NULL,
    entity      VARCHAR(100) NOT NULL COMMENT 'Table/resource name',
    entity_id   INT UNSIGNED,
    details     JSON,
    ip_address  VARCHAR(45),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (admin_id) REFERENCES Administrator(id) ON DELETE SET NULL
);

-- ============================================================
-- INDEXES
-- ============================================================

CREATE INDEX idx_person_email ON Person(email);
CREATE INDEX idx_club_name ON Club(name);
CREATE INDEX idx_club_district ON Club(district);
CREATE INDEX idx_competition_season ON Competition(season);
CREATE INDEX idx_competition_status ON Competition(status);
CREATE INDEX idx_game_date ON Game(game_date);
-- Composite indexes serve both single-column and multi-column filter patterns on Game
CREATE INDEX idx_game_comp_status ON Game(competition_id, status);
CREATE INDEX idx_game_comp_date  ON Game(competition_id, game_date);
CREATE INDEX idx_game_home_team  ON Game(home_team_id);
CREATE INDEX idx_game_away_team  ON Game(away_team_id);
CREATE INDEX idx_team_athlete_season ON TeamAthlete(season);
CREATE INDEX idx_auditlog_admin ON AuditLog(admin_id);
CREATE INDEX idx_auditlog_entity ON AuditLog(entity, entity_id);
CREATE INDEX idx_auditlog_created ON AuditLog(created_at);

-- ============================================================
-- SEED: Super Admin padrão
-- email: admin@fpb.pt  |  password: Admin1234 (bcrypt hash, cost 12)
-- ATENÇÃO: em produção, alterar esta password imediatamente após o
-- primeiro login (ou substituir o hash antes de correr o script).
-- ============================================================

INSERT INTO Administrator (name, email, password, is_superadmin, is_active)
VALUES (
    'Super Admin',
    'admin@fpb.pt',
    '$2b$12$LbanVKorfFH3FZ9fIBMwgOyf1CXYMV556cFUGVHZTvLw3jsi1OvLm',
    1,
    1
);
