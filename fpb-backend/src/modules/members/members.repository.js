const { query } = require('../../infrastructure/database/connection');

const PERSON_COLS = 'id, first_name, last_name, email, birth_date, nationality, photo_url, created_at, updated_at';

async function findAll({ search, role, page = 1, limit = 20 } = {}) {
    const clauses = [];
    const params = [];

    if (search) {
        clauses.push('(p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ?)');
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (role === 'athlete')   clauses.push('a.id IS NOT NULL');
    if (role === 'referee')   clauses.push('r.id IS NOT NULL');
    if (role === 'coach')     clauses.push('c.id IS NOT NULL');
    if (role === 'fpbmember') clauses.push('m.id IS NOT NULL');

    const where = clauses.length ? clauses.join(' AND ') : '1=1';

    const baseSql = `
        FROM Person p
        LEFT JOIN Athlete   a ON a.person_id = p.id
        LEFT JOIN Referee   r ON r.person_id = p.id
        LEFT JOIN Coach     c ON c.person_id = p.id
        LEFT JOIN FPBMember m ON m.person_id = p.id
        WHERE ${where}`;

    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(DISTINCT p.id) AS total ${baseSql}`, params),
        query(
            `SELECT p.${PERSON_COLS.split(', ').join(', p.')},
                IF(a.id IS NOT NULL, 1, 0) AS is_athlete,
                IF(r.id IS NOT NULL, 1, 0) AS is_referee,
                IF(c.id IS NOT NULL, 1, 0) AS is_coach,
                IF(m.id IS NOT NULL, 1, 0) AS is_fpbmember
             ${baseSql}
             ORDER BY p.last_name ASC, p.first_name ASC LIMIT ${lim} OFFSET ${offset}`,
            params
        ),
    ]);

    return { rows, total };
}

async function findById(id) {
    const [person] = await query(`SELECT ${PERSON_COLS} FROM Person WHERE id = ?`, [id]);
    if (!person) return null;

    const [
        [athlete],
        [referee],
        [coach],
        [fpbmember],
    ] = await Promise.all([
        query('SELECT id, license_number, position, jersey_number, height_cm, weight_kg, is_active FROM Athlete WHERE person_id = ?', [id]),
        query(
            `SELECT r.id, r.license_number, r.level, r.type, r.association_id, a.name AS association_name, r.is_active
             FROM Referee r LEFT JOIN Association a ON a.id = r.association_id
             WHERE r.person_id = ?`,
            [id]
        ),
        query('SELECT id, license_number, level, is_active                FROM Coach     WHERE person_id = ?', [id]),
        query('SELECT id, member_number, role_description, is_active     FROM FPBMember WHERE person_id = ?', [id]),
    ]);

    return {
        ...person,
        roles: {
            athlete:   athlete   || null,
            referee:   referee   || null,
            coach:     coach     || null,
            fpbmember: fpbmember || null,
        },
    };
}

async function createPerson(data, conn = null) {
    const { first_name, last_name, email, birth_date, nationality, photo_url } = data;
    const result = await query(
        'INSERT INTO Person (first_name, last_name, email, birth_date, nationality, photo_url) VALUES (?, ?, ?, ?, ?, ?)',
        [first_name, last_name, email || null, birth_date || null, nationality || null, photo_url || null],
        conn
    );
    return result.insertId;
}

async function updatePerson(id, data, conn = null) {
    const fields = ['first_name', 'last_name', 'email', 'birth_date', 'nationality', 'photo_url'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return;
    await query(
        `UPDATE Person SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
        [...updates.map(f => data[f]), id],
        conn
    );
}

async function removePerson(id) {
    await query('DELETE FROM Person WHERE id = ?', [id]);
}

// Whitelist de tabelas e colunas por role — os nomes de colunas NUNCA podem vir
// do body do pedido para dentro do SQL (injeção via identificadores).
const ROLE_TABLES = {
    athlete:   { table: 'Athlete',   fields: ['license_number', 'position', 'jersey_number', 'height_cm', 'weight_kg', 'is_active'] },
    referee:   { table: 'Referee',   fields: ['license_number', 'level', 'type', 'association_id', 'is_active'] },
    coach:     { table: 'Coach',     fields: ['license_number', 'level', 'is_active'] },
    fpbmember: { table: 'FPBMember', fields: ['member_number', 'role_description', 'is_active'] },
};

async function upsertRole(personId, role, roleData, conn = null) {
    const def = ROLE_TABLES[role];
    if (!def) return;

    const fields = def.fields.filter(f => roleData[f] !== undefined);

    const [existing] = await query(`SELECT id FROM ${def.table} WHERE person_id = ?`, [personId], conn);
    if (existing) {
        if (!fields.length) return;
        await query(
            `UPDATE ${def.table} SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE person_id = ?`,
            [...fields.map(f => roleData[f]), personId],
            conn
        );
    } else {
        const cols = ['person_id', ...fields];
        const values = [personId, ...fields.map(f => roleData[f])];
        await query(
            `INSERT INTO ${def.table} (${cols.join(', ')}) VALUES (${cols.map(() => '?').join(', ')})`,
            values,
            conn
        );
    }
}

async function removeRole(personId, role, conn = null) {
    const def = ROLE_TABLES[role];
    if (def) await query(`DELETE FROM ${def.table} WHERE person_id = ?`, [personId], conn);
}

async function hasRole(personId, role) {
    const def = ROLE_TABLES[role];
    if (!def) return false;
    const [row] = await query(`SELECT id FROM ${def.table} WHERE person_id = ?`, [personId]);
    return !!row;
}

module.exports = { findAll, findById, createPerson, updatePerson, removePerson, upsertRole, removeRole, hasRole };
