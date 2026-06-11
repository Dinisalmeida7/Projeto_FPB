const { query } = require('../../infrastructure/database/connection');

function buildWhere({ competition_id, team_id, status, date_from, date_to }) {
    const clauses = [];
    const params = [];
    if (competition_id) { clauses.push('g.competition_id = ?'); params.push(competition_id); }
    if (team_id)        { clauses.push('(g.home_team_id = ? OR g.away_team_id = ?)'); params.push(team_id, team_id); }
    if (status)         { clauses.push('g.status = ?'); params.push(status); }
    if (date_from)      { clauses.push('g.game_date >= ?'); params.push(date_from); }
    if (date_to)        { clauses.push('g.game_date <= ?'); params.push(date_to); }
    return { where: clauses.length ? clauses.join(' AND ') : '1=1', params };
}

async function findAll({ competition_id, team_id, status, date_from, date_to, page = 1, limit = 20 } = {}) {
    const { where, params } = buildWhere({ competition_id, team_id, status, date_from, date_to });
    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(
            `SELECT COUNT(*) AS total
             FROM Game g
             WHERE ${where}`,
            params
        ),
        query(
            `SELECT g.id, g.competition_id, g.home_team_id, g.away_team_id,
                    g.game_date, g.venue, g.round, g.score_home, g.score_away,
                    g.status, g.created_at, g.updated_at,
                    ht.name AS home_team_name,
                    at.name AS away_team_name,
                    c.name  AS competition_name,
                    c.season
             FROM Game g
             JOIN Team ht ON ht.id = g.home_team_id
             JOIN Team at ON at.id = g.away_team_id
             JOIN Competition c ON c.id = g.competition_id
             WHERE ${where}
             ORDER BY g.game_date DESC LIMIT ${lim} OFFSET ${offset}`,
            params
        ),
    ]);

    return { rows, total };
}

async function findById(id) {
    const [game] = await query(
        `SELECT g.id, g.competition_id, g.home_team_id, g.away_team_id,
                g.game_date, g.venue, g.round, g.score_home, g.score_away,
                g.status, g.notes, g.created_at, g.updated_at,
                ht.name AS home_team_name,
                at.name AS away_team_name,
                c.name  AS competition_name,
                c.season
         FROM Game g
         JOIN Team ht ON ht.id = g.home_team_id
         JOIN Team at ON at.id = g.away_team_id
         JOIN Competition c ON c.id = g.competition_id
         WHERE g.id = ?`,
        [id]
    );
    if (!game) return null;

    const referees = await query(
        `SELECT r.id, p.first_name, p.last_name, r.license_number, gr.role
         FROM GameReferee gr
         JOIN Referee r ON r.id = gr.referee_id
         JOIN Person  p ON p.id = r.person_id
         WHERE gr.game_id = ?`,
        [id]
    );

    return { ...game, referees };
}

async function create(data) {
    const { competition_id, home_team_id, away_team_id, game_date, venue, round, status } = data;
    const result = await query(
        `INSERT INTO Game (competition_id, home_team_id, away_team_id, game_date, venue, round, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [competition_id, home_team_id, away_team_id, game_date || null, venue || null, round || null, status || 'Agendado']
    );
    return findById(result.insertId);
}

async function update(id, data) {
    const fields = ['competition_id', 'home_team_id', 'away_team_id', 'game_date', 'venue',
                    'round', 'score_home', 'score_away', 'status', 'notes'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return findById(id);
    await query(
        `UPDATE Game SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
        [...updates.map(f => data[f]), id]
    );
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Game WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
