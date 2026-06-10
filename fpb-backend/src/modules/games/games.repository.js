const { query } = require('../../infrastructure/database/connection');

async function findAll({ competition_id, team_id, status, date_from, date_to, page = 1, limit = 20 } = {}) {
    let sql = `
        SELECT g.*,
            ht.name AS home_team_name, at.name AS away_team_name,
            c.name AS competition_name, c.season
        FROM Game g
        JOIN Team ht ON ht.id = g.home_team_id
        JOIN Team at ON at.id = g.away_team_id
        JOIN Competition c ON c.id = g.competition_id
        WHERE 1=1`;
    const params = [];

    if (competition_id) { sql += ' AND g.competition_id = ?'; params.push(competition_id); }
    if (team_id)        { sql += ' AND (g.home_team_id = ? OR g.away_team_id = ?)'; params.push(team_id, team_id); }
    if (status)         { sql += ' AND g.status = ?'; params.push(status); }
    if (date_from)      { sql += ' AND g.game_date >= ?'; params.push(date_from); }
    if (date_to)        { sql += ' AND g.game_date <= ?'; params.push(date_to); }

    const [{ total }] = await query(
        `SELECT COUNT(*) AS total FROM (${sql}) AS sub`, params
    );

    sql += ' ORDER BY g.game_date DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const rows = await query(sql, params);
    return { rows, total };
}

async function findById(id) {
    const [game] = await query(`
        SELECT g.*,
            ht.name AS home_team_name, at.name AS away_team_name,
            c.name AS competition_name, c.season
        FROM Game g
        JOIN Team ht ON ht.id = g.home_team_id
        JOIN Team at ON at.id = g.away_team_id
        JOIN Competition c ON c.id = g.competition_id
        WHERE g.id = ?`, [id]);

    if (!game) return null;

    const referees = await query(`
        SELECT r.id, p.first_name, p.last_name, r.license_number, gr.role
        FROM GameReferee gr
        JOIN Referee r ON r.id = gr.referee_id
        JOIN Person p ON p.id = r.person_id
        WHERE gr.game_id = ?`, [id]);

    return { ...game, referees };
}

async function create(data) {
    const { competition_id, home_team_id, away_team_id, game_date, venue, round, status } = data;
    const result = await query(
        `INSERT INTO Game (competition_id, home_team_id, away_team_id, game_date, venue, round, status)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [competition_id, home_team_id, away_team_id, game_date || null, venue || null, round || null, status || 'scheduled']
    );
    return findById(result.insertId);
}

async function update(id, data) {
    const fields = ['competition_id', 'home_team_id', 'away_team_id', 'game_date', 'venue',
                    'round', 'score_home', 'score_away', 'status', 'notes'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return findById(id);
    const sql = `UPDATE Game SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    await query(sql, [...updates.map(f => data[f]), id]);
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Game WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
