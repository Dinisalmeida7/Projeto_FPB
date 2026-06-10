const { query } = require('../../infrastructure/database/connection');

async function findAll({ search, district, is_active, page = 1, limit = 20 } = {}) {
    let sql = 'SELECT * FROM Club WHERE 1=1';
    const params = [];

    if (search) {
        sql += ' AND (name LIKE ? OR short_name LIKE ? OR city LIKE ?)';
        const like = `%${search}%`;
        params.push(like, like, like);
    }
    if (district) { sql += ' AND district = ?'; params.push(district); }
    if (is_active !== undefined) { sql += ' AND is_active = ?'; params.push(is_active); }

    const [{ total }] = await query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);

    sql += ' ORDER BY name ASC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const rows = await query(sql, params);
    return { rows, total };
}

async function findById(id) {
    const [row] = await query('SELECT * FROM Club WHERE id = ?', [id]);
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
