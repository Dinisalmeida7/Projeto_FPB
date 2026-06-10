const { query } = require('../../infrastructure/database/connection');

async function findAll({ category, page = 1, limit = 20 } = {}) {
    let sql = 'SELECT * FROM Document WHERE 1=1';
    const params = [];

    if (category) { sql += ' AND category = ?'; params.push(category); }

    const [{ total }] = await query(sql.replace('SELECT *', 'SELECT COUNT(*) AS total'), params);

    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), (parseInt(page) - 1) * parseInt(limit));

    const rows = await query(sql, params);
    return { rows, total };
}

async function findById(id) {
    const [row] = await query('SELECT * FROM Document WHERE id = ?', [id]);
    return row || null;
}

async function create(data) {
    const { title, description, category, file_path, file_name, file_size, mime_type, uploaded_by } = data;
    const result = await query(
        `INSERT INTO Document (title, description, category, file_path, file_name, file_size, mime_type, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || null, category || null, file_path, file_name, file_size || null, mime_type || null, uploaded_by || null]
    );
    return findById(result.insertId);
}

async function remove(id) {
    await query('DELETE FROM Document WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, remove };
