const { query } = require('../../infrastructure/database/connection');

const COLS = 'id, title, description, category, file_path, file_name, file_size, mime_type, uploaded_by, created_at, updated_at';

async function findAll({ category, page = 1, limit = 20 } = {}) {
    const where = category ? 'category = ?' : '1=1';
    const params = category ? [category] : [];
    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total FROM Document WHERE ${where}`, params),
        query(`SELECT ${COLS} FROM Document WHERE ${where} ORDER BY created_at DESC LIMIT ? OFFSET ?`, [...params, lim, offset]),
    ]);

    return { rows, total };
}

async function findById(id) {
    const [row] = await query(`SELECT ${COLS} FROM Document WHERE id = ?`, [id]);
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
