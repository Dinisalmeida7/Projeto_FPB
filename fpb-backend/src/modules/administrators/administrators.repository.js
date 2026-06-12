const { query } = require('../../infrastructure/database/connection');

async function findAll({ page = 1, limit = 20 } = {}) {
    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;
    const [[{ total }], rows] = await Promise.all([
        query('SELECT COUNT(*) AS total FROM Administrator'),
        query(
            `SELECT id, name, email, is_superadmin, is_active, last_login, created_at FROM Administrator ORDER BY name LIMIT ${lim} OFFSET ${offset}`
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

// T5: "DELETE /administradores/:id — Desativar administrador" — soft delete.
// Preserva a integridade do AuditLog e permite reativação via PUT (is_active).
async function deactivate(id) {
    await query('UPDATE Administrator SET is_active = 0 WHERE id = ?', [id]);
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

// T5: GET /logs — consulta do log de auditoria (RF35)
async function findLogs({ admin_id, action, entity, page = 1, limit = 20 } = {}) {
    const clauses = [];
    const params = [];
    if (admin_id) { clauses.push('l.admin_id = ?'); params.push(admin_id); }
    if (action)   { clauses.push('l.action = ?');   params.push(action); }
    if (entity)   { clauses.push('l.entity = ?');   params.push(entity); }
    const where = clauses.length ? clauses.join(' AND ') : '1=1';

    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total FROM AuditLog l WHERE ${where}`, params),
        query(
            `SELECT l.id, l.admin_id, a.name AS admin_name, l.admin_email,
                    l.action, l.entity, l.entity_id, l.details, l.ip_address, l.created_at
             FROM AuditLog l
             LEFT JOIN Administrator a ON a.id = l.admin_id
             WHERE ${where}
             ORDER BY l.created_at DESC, l.id DESC LIMIT ${lim} OFFSET ${offset}`,
            params
        ),
    ]);

    return { rows, total };
}

module.exports = { findAll, findById, findByEmail, create, update, deactivate, getPermissions, upsertPermission, findLogs };
