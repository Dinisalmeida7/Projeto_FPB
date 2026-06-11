const { query } = require('../../infrastructure/database/connection');

const COLS = 'id, name, short_name, acronym, city, district, founded_year, logo_url, website, email, phone, address, is_active, created_at, updated_at';

function buildWhere({ search, district, is_active }) {
    const clauses = [];
    const params = [];
    if (search) {
        clauses.push('(name LIKE ? OR short_name LIKE ? OR city LIKE ?)');
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (district !== undefined) { clauses.push('district = ?'); params.push(district); }
    if (is_active !== undefined) { clauses.push('is_active = ?'); params.push(is_active); }
    return { where: clauses.length ? clauses.join(' AND ') : '1=1', params };
}

async function findAll({ search, district, is_active, page = 1, limit = 20 } = {}) {
    const { where, params } = buildWhere({ search, district, is_active });
    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total FROM Club WHERE ${where}`, params),
        query(`SELECT ${COLS} FROM Club WHERE ${where} ORDER BY name ASC LIMIT ${lim} OFFSET ${offset}`, params),
    ]);

    return { rows, total };
}

async function findById(id) {
    const [row] = await query(`SELECT ${COLS} FROM Club WHERE id = ?`, [id]);
    return row || null;
}

async function create(data) {
    const { name, short_name, acronym, city, district, founded_year, logo_url, website, email, phone, address } = data;
    const result = await query(
        `INSERT INTO Club (name, short_name, acronym, city, district, founded_year, logo_url, website, email, phone, address)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [name, short_name || null, acronym || null, city || null, district || null,
         founded_year || null, logo_url || null, website || null, email || null, phone || null, address || null]
    );
    return findById(result.insertId);
}

async function update(id, data) {
    const fields = ['name', 'short_name', 'acronym', 'city', 'district', 'founded_year',
                    'logo_url', 'website', 'email', 'phone', 'address', 'is_active'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return findById(id);
    const sql = `UPDATE Club SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    await query(sql, [...updates.map(f => data[f]), id]);
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Club WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
