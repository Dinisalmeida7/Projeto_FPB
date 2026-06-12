const { query } = require('../../infrastructure/database/connection');

const COLS = 'id, name, created_at, updated_at';

async function findAll({ search, page = 1, limit = 20 } = {}) {
    const where = search ? 'name LIKE ?' : '1=1';
    const params = search ? [`%${search}%`] : [];
    const lim = parseInt(limit) || 20;
    const offset = ((parseInt(page) || 1) - 1) * lim;

    const [[{ total }], rows] = await Promise.all([
        query(`SELECT COUNT(*) AS total FROM Association WHERE ${where}`, params),
        query(`SELECT ${COLS} FROM Association WHERE ${where} ORDER BY name ASC LIMIT ${lim} OFFSET ${offset}`, params),
    ]);

    return { rows, total };
}

// Ficha composta: associação + clubes filiados + seleções distritais (T4: Grupo 1)
async function findById(id) {
    const [row] = await query(`SELECT ${COLS} FROM Association WHERE id = ?`, [id]);
    if (!row) return null;

    const [clubs, teams] = await Promise.all([
        query('SELECT id, name, city, district, is_active FROM Club WHERE association_id = ? ORDER BY name', [id]),
        query('SELECT id, name, gender, age_group, is_active FROM Team WHERE association_id = ? ORDER BY name', [id]),
    ]);

    return { ...row, clubs, teams };
}

async function create(name) {
    const result = await query('INSERT INTO Association (name) VALUES (?)', [name]);
    return findById(result.insertId);
}

async function update(id, name) {
    await query('UPDATE Association SET name = ? WHERE id = ?', [name, id]);
    return findById(id);
}

// FKs em Club/Team/Referee são ON DELETE SET NULL — remover uma associação
// não apaga clubes nem equipas, apenas desfaz a ligação.
async function remove(id) {
    await query('DELETE FROM Association WHERE id = ?', [id]);
}

module.exports = { findAll, findById, create, update, remove };
