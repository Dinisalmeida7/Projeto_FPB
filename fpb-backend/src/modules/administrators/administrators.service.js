const bcrypt = require('bcryptjs');
const AppError = require('../../shared/utils/AppError');
const { withTransaction } = require('../../infrastructure/database/connection');
const repo = require('./administrators.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const admin = await repo.findById(id);
    if (!admin) throw new AppError('Administrator not found.', 404);
    const permissions = await repo.getPermissions(id);
    return { ...admin, permissions };
}

async function createAdmin(data) {
    const existing = await repo.findByEmail(data.email);
    if (existing) throw new AppError('Email already in use.', 409);

    const hashed = await bcrypt.hash(data.password, 12);
    return repo.create({ ...data, password: hashed });
}

async function updateAdmin(id, data) {
    await getById(id);
    if (data.password) data.password = await bcrypt.hash(data.password, 12);
    return repo.update(id, data);
}

// Soft delete (T5: "Desativar administrador")
async function deleteAdmin(id, requesterId) {
    if (parseInt(id) === parseInt(requesterId)) {
        throw new AppError('Cannot deactivate your own account.', 400);
    }
    await getById(id);
    await repo.deactivate(id);
}

async function setPermissions(adminId, permissions) {
    await getById(adminId);

    await withTransaction(async (conn) => {
        for (const perm of permissions) {
            await repo.upsertPermission(adminId, perm.area, perm.can_create, perm.can_edit, perm.can_delete, conn);
        }
    });

    return repo.getPermissions(adminId);
}

async function getPermissions(adminId) {
    await getById(adminId);
    return repo.getPermissions(adminId);
}

async function getLogs(filters) {
    return repo.findLogs(filters);
}

module.exports = { getAll, getById, createAdmin, updateAdmin, deleteAdmin, setPermissions, getPermissions, getLogs };
