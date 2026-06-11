const { query } = require('../../infrastructure/database/connection');

async function findAll({ page = 1, limit = 20 } = {}) {
    const lim = parseInt(limit);
    const offset = (parseInt(page) - 1) * lim;
    const [[{ total }], rows] = await Promise.all([
        query('SELECT COUNT(*) AS total FROM Administrator'),
        query(
            'SELECT id, name, email, is_superadmin, is_active, last_login, created_at FROM Administrator ORDER BY name LIMIT ? OFFSET ?',
            [lim, offset]
        ),
    ]);
    return { rows, total };
}

async function findById(id) {
    const [row] = await query(
        'SELECT id, name, email, is_superadmin, is_active, last_login, created_at FROM Administrator WHERE id = ?',
        [id]
    );
    return row || null;
}

async function findByEmail(email) {
    const [row] = await query('SELECT id FROM Administrator WHERE email = ?', [email]);
    return row || null;
}

async function create(data) {
    const { name, email, password, is_superadmin } = data;
    const result = await query(
        'INSERT INTO Administrator (name, email, password, is_superadmin) VALUES (?, ?, ?, ?)',
        [name, email, password, is_superadmin ? 1 : 0]
    );
    return findById(result.insertId);
}

async function update(id, data) {
    const fields = ['name', 'email', 'is_superadmin', 'is_active'];
    const updates = fields.filter(f => data[f] !== undefined);
    if (data.password) { updates.push('password'); }
    if (!updates.length) return findById(id);
    const sql = `UPDATE Administrator SET ${updates.map(f => `${f} = ?`).join(', ')} WHERE id = ?`;
    const values = updates.map(f => f === 'password' ? data.password : data[f]);
    await query(sql, [...values, id]);
    return findById(id);
}

async function remove(id) {
    await query('DELETE FROM Administrator WHERE id = ?', [id]);
}

async function getPermissions(adminId) {
    return query('SELECT * FROM Permission WHERE admin_id = ?', [adminId]);
}

async function upsertPermission(adminId, area, can_create, can_edit, can_delete, conn = null) {
    await query(
        `INSERT INTO Permission (admin_id, area, can_create, can_edit, can_delete)
         VALUES (?, ?, ?, ?, ?)
         ON DUPLICATE KEY UPDATE can_create = VALUES(can_create), can_edit = VALUES(can_edit), can_delete = VALUES(can_delete)`,
        [adminId, area, can_create ? 1 : 0, can_edit ? 1 : 0, can_delete ? 1 : 0],
        conn
    );
}

module.exports = { findAll, findById, findByEmail, create, update, remove, getPermissions, upsertPermission };
