CREATE DATABASE IF NOT EXISTS fpb_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE fpb_db;

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
    level       ENUM('national','regional','local') DEFAULT 'local',
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (person_id) REFERENCES Person(id) ON DELETE CASCADE
);

CREATE TABLE Coach (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id   INT UNSIGNED NOT NULL UNIQUE,
    license_number VARCHAR(50) UNIQUE,
    is_active   TINYINT(1) DEFAULT 1,
    FOREIGN KEY (person_id) REFERENCES Person(id) ON DELETE CASCADE
);

CREATE TABLE FPBMember (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    person_id   INT UNSIGNED NOT NULL UNIQUE,
    member_number VARCHAR(50) UNIQUE,
    role_description VARCHAR(200),
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
    founded_year YEAR,
    logo_url    VARCHAR(500),
    website     VARCHAR(500),
    email       VARCHAR(255),
    phone       VARCHAR(30),
    address     VARCHAR(500),
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE TABLE Team (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(200) NOT NULL,
    club_id     INT UNSIGNED,
    gender      ENUM('male','female','mixed') NOT NULL DEFAULT 'male',
    age_group   VARCHAR(50) COMMENT 'e.g. Seniores, Sub-20, Sub-16',
    coach_id    INT UNSIGNED,
    is_active   TINYINT(1) DEFAULT 1,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (club_id) REFERENCES Club(id) ON DELETE SET NULL,
    FOREIGN KEY (coach_id) REFERENCES Coach(id) ON DELETE SET NULL
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
    score_home      TINYINT UNSIGNED,
    score_away      TINYINT UNSIGNED,
    status          ENUM('scheduled','ongoing','finished','postponed','cancelled') DEFAULT 'scheduled',
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
-- DOCUMENTS
-- ============================================================

CREATE TABLE Document (
    id          INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title       VARCHAR(300) NOT NULL,
    description TEXT,
    category    VARCHAR(100),
    file_path   VARCHAR(500) NOT NULL,
    file_name   VARCHAR(255) NOT NULL,
    file_size   INT UNSIGNED,
    mime_type   VARCHAR(100),
    uploaded_by INT UNSIGNED,
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
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
CREATE INDEX idx_game_competition ON Game(competition_id);
CREATE INDEX idx_game_status ON Game(status);
CREATE INDEX idx_team_athlete_season ON TeamAthlete(season);
CREATE INDEX idx_auditlog_admin ON AuditLog(admin_id);
CREATE INDEX idx_auditlog_entity ON AuditLog(entity, entity_id);
CREATE INDEX idx_auditlog_created ON AuditLog(created_at);

-- ============================================================
-- SEED: Super Admin padrão
-- password: Admin@FPB2025 (bcrypt hash)
-- ============================================================

INSERT INTO Administrator (name, email, password, is_superadmin, is_active)
VALUES (
    'Super Admin',
    'admin@fpb.pt',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMlFAZZ3cR3Lhhu5jcb5kqVk5y',
    1,
    1
);
