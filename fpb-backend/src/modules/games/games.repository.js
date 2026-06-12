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

    const [referees, athletes] = await Promise.all([
        query(
            `SELECT r.id, p.first_name, p.last_name, r.license_number, r.type, gr.role
             FROM GameReferee gr
             JOIN Referee r ON r.id = gr.referee_id
             JOIN Person  p ON p.id = r.person_id
             WHERE gr.game_id = ?`,
            [id]
        ),
        query(
            `SELECT ga.athlete_id, p.first_name, p.last_name, a.license_number,
                    ga.points, ga.rebounds, ga.assists, ga.minutes_played
             FROM GameAthlete ga
             JOIN Athlete a ON a.id = ga.athlete_id
             JOIN Person  p ON p.id = a.person_id
             WHERE ga.game_id = ?`,
            [id]
        ),
    ]);

    return { ...game, referees, athletes };
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

// ---------- Juízes do jogo (T4: JuizJogo / T5: /jogos/:id/juizes) ----------

async function findRefereeById(refereeId) {
    const [row] = await query(
        `SELECT r.id, p.first_name, p.last_name, r.license_number, r.type, r.is_active
         FROM Referee r JOIN Person p ON p.id = r.person_id
         WHERE r.id = ?`,
        [refereeId]
    );
    return row || null;
}

async function addReferee(gameId, refereeId, role = 'main') {
    await query(
        'INSERT INTO GameReferee (game_id, referee_id, role) VALUES (?, ?, ?)',
        [gameId, refereeId, role]
    );
}

async function removeReferee(gameId, refereeId) {
    const result = await query(
        'DELETE FROM GameReferee WHERE game_id = ? AND referee_id = ?',
        [gameId, refereeId]
    );
    return result.affectedRows > 0;
}

// ---------- Atletas do jogo (T4: AtletaJogo / T5: /jogos/:id/atletas) ----------

async function findAthleteById(athleteId) {
    const [row] = await query(
        `SELECT a.id, p.first_name, p.last_name, a.license_number, a.is_active
         FROM Athlete a JOIN Person p ON p.id = a.person_id
         WHERE a.id = ?`,
        [athleteId]
    );
    return row || null;
}

async function findGameAthlete(gameId, athleteId) {
    const [row] = await query(
        `SELECT ga.game_id, ga.athlete_id, p.first_name, p.last_name,
                ga.points, ga.rebounds, ga.assists, ga.minutes_played
         FROM GameAthlete ga
         JOIN Athlete a ON a.id = ga.athlete_id
         JOIN Person  p ON p.id = a.person_id
         WHERE ga.game_id = ? AND ga.athlete_id = ?`,
        [gameId, athleteId]
    );
    return row || null;
}

async function addAthlete(gameId, athleteId, stats) {
    await query(
        `INSERT INTO GameAthlete (game_id, athlete_id, points, rebounds, assists, minutes_played)
         VALUES (?, ?, ?, ?, ?, ?)`,
        [gameId, athleteId, stats.points ?? 0, stats.rebounds ?? 0, stats.assists ?? 0, stats.minutes_played ?? 0]
    );
    return findGameAthlete(gameId, athleteId);
}

async function updateAthleteStats(gameId, athleteId, stats) {
    const fields = ['points', 'rebounds', 'assists', 'minutes_played'].filter(f => stats[f] !== undefined);
    if (fields.length) {
        await query(
            `UPDATE GameAthlete SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE game_id = ? AND athlete_id = ?`,
            [...fields.map(f => stats[f]), gameId, athleteId]
        );
    }
    return findGameAthlete(gameId, athleteId);
}

async function removeAthlete(gameId, athleteId) {
    const result = await query(
        'DELETE FROM GameAthlete WHERE game_id = ? AND athlete_id = ?',
        [gameId, athleteId]
    );
    return result.affectedRows > 0;
}

module.exports = {
    findAll, findById, create, update, remove,
    findRefereeById, addReferee, removeReferee,
    findAthleteById, findGameAthlete, addAthlete, updateAthleteStats, removeAthlete,
};
