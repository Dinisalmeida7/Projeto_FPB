const { query } = require('../../infrastructure/database/connection');

const COLS = 'id, name, season, gender, age_group, level, status, start_date, end_date, description, created_at, updated_at';

function buildWhere({ search, season, status }) {
    const clauses = [];
    const params = [];
    if (search) { clauses.push('name LIKE ?'); params.push(`%${search}%`); }
    if (season) { clauses.push('season = ?'); params.push(season); }
    if (status) { clauses.push('status = ?'); params.push(status); }
    return { where: clauses.length ? clauses.join(' AND ') : '1=1', params };
}

async function findAll({ search, season, status, page = 1, limit = 20 } = {}) {
    const { where, params } = buildWhere({ search, season, status });
    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total FROM Competition WHERE ${where}`, params),
        query(`SELECT ${COLS} FROM Competition WHERE ${where} ORDER BY start_date DESC LIMIT ? OFFSET ?`, [...params, lim, offset]),
    ]);

    return { rows, total };
}

async function findById(id) {
    const [row] = await query(`SELECT ${COLS} FROM Competition WHERE id = ?`, [id]);
    return row || null;
}

async function getStandings(competitionId) {
    return query(`
        SELECT
            t.id AS team_id,
            t.name AS team_name,
            cl.name AS club_name,
            cl.logo_url AS club_logo,
            COUNT(g.id) AS played,
            SUM(
                CASE
                    WHEN g.home_team_id = t.id AND g.score_home > g.score_away THEN 1
                    WHEN g.away_team_id = t.id AND g.score_away > g.score_home THEN 1
                    ELSE 0
                END
            ) AS wins,
            SUM(
                CASE
                    WHEN g.home_team_id = t.id AND g.score_home < g.score_away THEN 1
                    WHEN g.away_team_id = t.id AND g.score_away < g.score_home THEN 1
                    ELSE 0
                END
            ) AS losses,
            SUM(
                CASE
                    WHEN g.home_team_id = t.id THEN COALESCE(g.score_home, 0)
                    WHEN g.away_team_id = t.id THEN COALESCE(g.score_away, 0)
                END
            ) AS points_for,
            SUM(
                CASE
                    WHEN g.home_team_id = t.id THEN COALESCE(g.score_away, 0)
                    WHEN g.away_team_id = t.id THEN COALESCE(g.score_home, 0)
                END
            ) AS points_against
        FROM CompetitionTeam ct
        JOIN Team t ON t.id = ct.team_id
        LEFT JOIN Club cl ON cl.id = t.club_id
        LEFT JOIN Game g ON g.competition_id = ct.competition_id
            AND (g.home_team_id = t.id OR g.away_team_id = t.id)
            AND g.status = 'finished'
        WHERE ct.competition_id = ?
        GROUP BY t.id, t.name, cl.name, cl.logo_url
        ORDER BY wins DESC, (points_for - points_against) DESC
    `, [competitionId]);
}

async function create(data) {
    const { name, season, gender, age_group, level, status, start_date, end_date, description } = data;
    const result = await query(
        `INSERT INTO Competition (name, season, gender, age_group, level, status, start_date, end_date, description)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, season, gender || 'male', age_group || null, level || 'national',
         status || 'scheduled', start_date || null, end_date || null, description || null]
    );
    return findById(result.insertId);
}

async function update(id, data) {
    const fields = ['name', 'season', 'gender', 'age_group', 'level', 'status', 'start_date', 'end_date', 'description'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return findById(id);
    await query(
        `UPDATE Competition SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
        [...updates.map(f => data[f]), id]
    );
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Competition WHERE id = ?', [id]);
}

async function addTeam(competitionId, teamId) {
    await query('INSERT IGNORE INTO CompetitionTeam (competition_id, team_id) VALUES (?, ?)', [competitionId, teamId]);
}

async function removeTeam(competitionId, teamId) {
    await query('DELETE FROM CompetitionTeam WHERE competition_id = ? AND team_id = ?', [competitionId, teamId]);
}

module.exports = { findAll, findById, getStandings, create, update, remove, addTeam, removeTeam };
