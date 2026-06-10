const { query } = require('../../infrastructure/database/connection');

async function findAdminByEmail(email) {
    const [row] = await query(
        'SELECT id, name, email, password, is_superadmin, is_active FROM Administrator WHERE email = ?',
        [email]
    );
    return row || null;
}

async function updateLastLogin(id) {
    await query('UPDATE Administrator SET last_login = NOW() WHERE id = ?', [id]);
}

module.exports = { findAdminByEmail, updateLastLogin };
