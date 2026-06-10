const { query, getConnection } = require('../../infrastructure/database/connection');

async function findAll({ search, role, page = 1, limit = 20 } = {}) {
    let sql = `
        SELECT p.*,
            IF(a.id IS NOT NULL, 1, 0) AS is_athlete,
            IF(r.id IS NOT NULL, 1, 0) AS is_referee,
            IF(c.id IS NOT NULL, 1, 0) AS is_coach,
            IF(m.id IS NOT NULL, 1, 0) AS is_fpbmember
        FROM Person p
        LEFT JOIN Athlete  a ON a.person_id = p.id
        LEFT JOIN Referee  r ON r.person_id = p.id
        LEFT JOIN Coach    c ON c.person_id = p.id
        LEFT JOIN FPBMember m ON m.person_id = p.id
        WHERE 1=1`;
    const params = [];

    if (search) {
        sql += ' AND (p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ?)';
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (role === 'athlete')   sql += ' AND a.id IS NOT NULL';
    if (role === 'referee')   sql += ' AND r.id IS NOT NULL';
    if (role === 'coach')     sql += ' AND c.id IS NOT NULL';
    if (role === 'fpbmember') sql += ' AND m.id IS NOT NULL';

    const countSql = `SELECT COUNT(*) AS total FROM (${sql}) AS sub`;
    const [{ total }] = await query(countSql, params);

    sql += ' ORDER BY p.last_name ASC, p.first_name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const rows = await query(sql, params);
    return { rows, total };
}

async function findById(id) {
    const [person] = await query('SELECT * FROM Person WHERE id = ?', [id]);
    if (!person) return null;

    const [athlete]   = await query('SELECT * FROM Athlete   WHERE person_id = ?', [id]);
    const [referee]   = await query('SELECT * FROM Referee   WHERE person_id = ?', [id]);
    const [coach]     = await query('SELECT * FROM Coach     WHERE person_id = ?', [id]);
    const [fpbmember] = await query('SELECT * FROM FPBMember WHERE person_id = ?', [id]);

    return { ...person, roles: { athlete: athlete || null, referee: referee || null, coach: coach || null, fpbmember: fpbmember || null } };
}

async function createPerson(data) {
    const { first_name, last_name, email, birth_date, nationality, photo_url } = data;
    const result = await query(
        'INSERT INTO Person (first_name, last_name, email, birth_date, nationality, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email || null, birth_date || null, nationality || null, photo_url || null]
    );
    return result.insertId;
}

async function updatePerson(id, data) {
    const fields = ['first_name', 'last_name', 'email', 'birth_date', 'nationality', 'photo_url'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return;
    const sql = `UPDATE Person SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    await query(sql, [...updates.map(f => data[f]), id]);
}

async function removePerson(id) {
    await query('DELETE FROM Person WHERE id = ?', [id]);
}

async function upsertRole(personId, role, roleData) {
    const tables = { athlete: 'Athlete', referee: 'Referee', coach: 'Coach', fpbmember: 'FPBMember' };
    const table = tables[role];
    if (!table) return;

    const [existing] = await query(`SELECT id FROM ${table} WHERE person_id = ?`, [personId]);
    if (existing) {
        const fields = Object.keys(roleData);
        if (!fields.length) return;
        const sql = `UPDATE ${table} SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE person_id = ?`;
        await query(sql, [...fields.map(f => roleData[f]), personId]);
    } else {
        const fields = ['person_id', ...Object.keys(roleData)];
        const values = [personId, ...Object.values(roleData)];
        await query(
            `INSERT INTO ${table} (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`,
            values
        );
    }
}

async function removeRole(personId, role) {
    const tables = { athlete: 'Athlete', referee: 'Referee', coach: 'Coach', fpbmember: 'FPBMember' };
    const table = tables[role];
    if (table) await query(`DELETE FROM ${table} WHERE person_id = ?`, [personId]);
}

module.exports = { findAll, findById, createPerson, updatePerson, removePerson, upsertRole, removeRole };
