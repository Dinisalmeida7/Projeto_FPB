-- ============================================================
-- SEED DE DEMONSTRAÇÃO / TESTES MANUAIS
-- ============================================================
-- Como não existe endpoint de Equipas (Team) na API, estes dados
-- são necessários para testar manualmente a classificação:
-- clubes, equipas, uma competição e a inscrição das equipas.
--
-- Correr UMA vez sobre um schema acabado de criar:
--   mysql -u root -p fpb_db < src/infrastructure/database/Seed.sql
--
-- (Club.name é UNIQUE — correr duas vezes dá erro de duplicado.)
-- ============================================================

USE fpb_db;

-- Clubes ------------------------------------------------------
INSERT INTO Club (name, short_name, acronym, city, district, founded_year) VALUES
('Sporting Clube de Portugal', 'Sporting', 'SCP', 'Lisboa',   'Lisboa', 1906),
('Futebol Clube do Porto',     'FC Porto', 'FCP', 'Porto',    'Porto',  1893),
('Sport Lisboa e Benfica',     'Benfica',  'SLB', 'Lisboa',   'Lisboa', 1904),
('Imortal Basketball Clube',   'Imortal',  'IBC', 'Albufeira','Faro',   1930);

-- Equipas (uma equipa sénior masculina por clube) -------------
INSERT INTO Team (name, club_id, gender, age_group)
SELECT CONCAT(short_name, ' - Seniores M'), id, 'male', 'Seniores'
FROM Club
WHERE name IN (
    'Sporting Clube de Portugal',
    'Futebol Clube do Porto',
    'Sport Lisboa e Benfica',
    'Imortal Basketball Clube'
);

-- Competição --------------------------------------------------
INSERT INTO Competition (name, season, gender, age_group, level, status, start_date, end_date)
VALUES ('Liga Portuguesa de Basquetebol', '2024/2025', 'male', 'Seniores', 'national', 'ongoing', '2024-10-01', '2025-05-31');

-- Inscrição das 4 equipas na competição -----------------------
INSERT INTO CompetitionTeam (competition_id, team_id)
SELECT c.id, t.id
FROM Competition c
JOIN Team t ON t.gender = 'male' AND t.age_group = 'Seniores'
WHERE c.name = 'Liga Portuguesa de Basquetebol' AND c.season = '2024/2025';

-- ============================================================
-- IDs para usar nos testes manuais (Thunder Client / Postman)
-- ============================================================
SELECT t.id AS team_id, t.name AS equipa, cl.short_name AS clube
FROM Team t JOIN Club cl ON cl.id = t.club_id
ORDER BY t.id;

SELECT id AS competition_id, name AS competicao, season AS epoca
FROM Competition
WHERE name = 'Liga Portuguesa de Basquetebol' AND season = '2024/2025';
