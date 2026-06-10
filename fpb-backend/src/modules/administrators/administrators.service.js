const bcrypt = require('bcryptjs');
const AppError = require('../../shared/utils/AppError');
const repo = require('./administrators.repository');

const VALID_AREAS = ['clubs', 'competitions', 'games', 'members', 'documents', 'administrators'];

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const admin = await repo.findById(id);
    if (!admin) throw new AppError('Administrator not found.', 404);
    const permissions = await repo.getPermissions(id);
    return { ...admin, permissions };
}

async function createAdmin(data) {
    if (!data.name || !data.email || !data.password) {
        throw new AppError('name, email and password are required.', 400);
    }
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

async function deleteAdmin(id, requesterId) {
    if (parseInt(id) === parseInt(requesterId)) {
        throw new AppError('Cannot delete your own account.', 400);
    }
    await getById(id);
    await repo.remove(id);
}

async function setPermissions(adminId, permissions) {
    await getById(adminId);

    for (const perm of permissions) {
        if (!VALID_AREAS.includes(perm.area)) {
            throw new AppError(`Invalid area: ${perm.area}.`, 400);
        }
        await repo.upsertPermission(adminId, perm.area, perm.can_create, perm.can_edit, perm.can_delete);
    }

    return repo.getPermissions(adminId);
}

module.exports = { getAll, getById, createAdmin, updateAdmin, deleteAdmin, setPermissions };
