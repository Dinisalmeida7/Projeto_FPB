const { query } = require('../../infrastructure/database/connection');

const COLS = 'd.id, d.title, d.description, d.category_id, c.name AS category_name, d.published_date, ' +
             'd.file_path, d.file_name, d.file_size, d.mime_type, d.uploaded_by, d.created_at, d.updated_at';
const BASE = 'FROM Document d LEFT JOIN DocumentCategory c ON c.id = d.category_id';

async function findAll({ category_id, page = 1, limit = 20 } = {}) {
    const where = category_id ? 'd.category_id = ?' : '1=1';
    const params = category_id ? [category_id] : [];
    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total ${BASE} WHERE ${where}`, params),
        query(`SELECT ${COLS} ${BASE} WHERE ${where} ORDER BY d.published_date DESC, d.created_at DESC LIMIT ${lim} OFFSET ${offset}`, params),
    ]);

    return { rows, total };
}

async function findById(id) {
    const [row] = await query(`SELECT ${COLS} ${BASE} WHERE d.id = ?`, [id]);
    return row || null;
}

async function create(data) {
    const { title, description, category_id, published_date, file_path, file_name, file_size, mime_type, uploaded_by } = data;
    const result = await query(
        `INSERT INTO Document (title, description, category_id, published_date, file_path, file_name, file_size, mime_type, uploaded_by)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [title, description || null, category_id || null, published_date || null,
         file_path, file_name, file_size || null, mime_type || null, uploaded_by || null]
    );
    return findById(result.insertId);
}

// Edição de metadados (T5: PUT /documentos/:id) — o ficheiro em si não é substituído.
async function update(id, data) {
    const fields = ['title', 'description', 'category_id', 'published_date'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (!updates.length) return findById(id);
    await query(
        `UPDATE Document SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`,
        [...updates.map(f => data[f]), id]
    );
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Document WHERE id = ?', [id]);
}

// ---------- Categorias (T4: CategoriaDocumento) ----------

async function findAllCategories() {
    return query('SELECT id, name, created_at, updated_at FROM DocumentCategory ORDER BY name ASC');
}

async function findCategoryById(id) {
    const [row] = await query('SELECT id, name, created_at, updated_at FROM DocumentCategory WHERE id = ?', [id]);
    return row || null;
}

async function createCategory(name) {
    const result = await query('INSERT INTO DocumentCategory (name) VALUES (?)', [name]);
    return findCategoryById(result.insertId);
}

async function updateCategory(id, name) {
    await query('UPDATE DocumentCategory SET name = ? WHERE id = ?', [name, id]);
    return findCategoryById(id);
}

async function removeCategory(id) {
    await query('DELETE FROM DocumentCategory WHERE id = ?', [id]);
}

module.exports = {
    findAll, findById, create, update, remove,
    findAllCategories, findCategoryById, createCategory, updateCategory, removeCategory,
};
