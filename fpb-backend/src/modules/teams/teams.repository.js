const { query } = require('../../infrastructure/database/connection');

const COLS = 't.id, t.name, t.club_id, c.name AS club_name, t.association_id, a.name AS association_name, ' +
             't.gender, t.age_group, t.is_active, t.created_at, t.updated_at';
const BASE = `FROM Team t
              LEFT JOIN Club c ON c.id = t.club_id
              LEFT JOIN Association a ON a.id = t.association_id`;

function buildWhere({ search, club_id, association_id, gender, age_group, is_active }) {
    const clauses = [];
    const params = [];
    if (search)                    { clauses.push('t.name LIKE ?');         params.push(`%${search}%`); }
    if (club_id)                   { clauses.push('t.club_id = ?');         params.push(club_id); }
    if (association_id)            { clauses.push('t.association_id = ?');  params.push(association_id); }
    if (gender)                    { clauses.push('t.gender = ?');          params.push(gender); }
    if (age_group)                 { clauses.push('t.age_group = ?');       params.push(age_group); }
    if (is_active !== undefined)   { clauses.push('t.is_active = ?');       params.push(is_active); }
    return { where: clauses.length ? clauses.join(' AND ') : '1=1', params };
}

async function findAll(filters = {}) {
    const { where, params } = buildWhere(filters);
    const lim = parseInt(filters.limit) || 20;
    const offset = ((parseInt(filters.page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total ${BASE} WHERE ${where}`, params),
        query(`SELECT ${COLS} ${BASE} WHERE ${where} ORDER BY t.name ASC LIMIT ${lim} OFFSET ${offset}`, params),
    ]);

    return { rows, total };
}

// Ficha composta: equipa + treinadores (T4: TreinadorEquipa) + plantel (T4: AtletaEquipa)
async function findById(id) {
    const [team] = await query(`SELECT ${COLS} ${BASE} WHERE t.id = ?`, [id]);
    if (!team) return null;

    const [coaches, athletes] = await Promise.all([
        query(
            `SELECT co.id, p.first_name, p.last_name, co.license_number, co.level
             FROM CoachTeam ct
             JOIN Coach  co ON co.id = ct.coach_id
             JOIN Person p  ON p.id = co.person_id
             WHERE ct.team_id = ?
             ORDER BY p.last_name, p.first_name`,
            [id]
        ),
        query(
            `SELECT at.id, p.first_name, p.last_name, at.license_number, at.position,
                    ta.season, ta.jersey_number, ta.joined_at, ta.left_at
             FROM TeamAthlete ta
             JOIN Athlete at ON at.id = ta.athlete_id
             JOIN Person  p  ON p.id = at.person_id
             WHERE ta.team_id = ?
             ORDER BY ta.season DESC, p.last_name, p.first_name`,
            [id]
        ),
    ]);

    return { ...team, coaches, athletes };
}

async function create(data) {
    const { name, club_id, association_id, gender, age_group } = data;
    const result = await query(
        'INSERT INTO Team (name, club_id, association_id, gender, age_group) VALUES (?, ?, ?, ?, ?)',
        [name, club_id || null, association_id || null, gender || 'male', age_group || null]
    );
    return findById(result.insertId);
}

async function update(id, data) {
    const fields = ['name', 'club_id', 'association_id', 'gender', 'age_group', 'is_active'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return findById(id);
    await query(
        `UPDATE Team SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
        [...updates.map(f => data[f]), id]
    );
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Team WHERE id = ?', [id]);
}

// ---------- Treinadores (T4: TreinadorEquipa) ----------

async function findCoachById(coachId) {
    const [row] = await query(
        `SELECT co.id, p.first_name, p.last_name, co.license_number, co.level, co.is_active
         FROM Coach co JOIN Person p ON p.id = co.person_id
         WHERE co.id = ?`,
        [coachId]
    );
    return row || null;
}

async function addCoach(teamId, coachId) {
    await query('INSERT INTO CoachTeam (coach_id, team_id) VALUES (?, ?)', [coachId, teamId]);
}

async function removeCoach(teamId, coachId) {
    const result = await query('DELETE FROM CoachTeam WHERE team_id = ? AND coach_id = ?', [teamId, coachId]);
    return result.affectedRows > 0;
}

// ---------- Plantel (T4: AtletaEquipa) ----------

async function findAthleteById(athleteId) {
    const [row] = await query(
        `SELECT at.id, p.first_name, p.last_name, at.license_number, at.is_active
         FROM Athlete at JOIN Person p ON p.id = at.person_id
         WHERE at.id = ?`,
        [athleteId]
    );
    return row || null;
}

async function addAthlete(teamId, data) {
    await query(
        'INSERT INTO TeamAthlete (team_id, athlete_id, season, jersey_number, joined_at) VALUES (?, ?, ?, ?, ?)',
        [teamId, data.athlete_id, data.season, data.jersey_number || null, data.joined_at || null]
    );
}

// Sem season remove o atleta de todas as épocas da equipa; com season só essa época.
async function removeAthlete(teamId, athleteId, season) {
    const sql = season
        ? 'DELETE FROM TeamAthlete WHERE team_id = ? AND athlete_id = ? AND season = ?'
        : 'DELETE FROM TeamAthlete WHERE team_id = ? AND athlete_id = ?';
    const params = season ? [teamId, athleteId, season] : [teamId, athleteId];
    const result = await query(sql, params);
    return result.affectedRows > 0;
}

module.exports = {
    findAll, findById, create, update, remove,
    findCoachById, addCoach, removeCoach,
    findAthleteById, addAthlete, removeAthlete,
};
