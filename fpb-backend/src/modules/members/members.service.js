const AppError = require('../../shared/utils/AppError');
const { withTransaction } = require('../../infrastructure/database/connection');
const repo = require('./members.repository');

async function getAll(filters) {
    return repo.findAll(filters);
}

async function getById(id) {
    const person = await repo.findById(id);
    if (!person) throw new AppError('Member not found.', 404);
    return person;
}

async function createMember(data) {
    let personId;
    await withTransaction(async (conn) => {
        personId = await repo.createPerson(data, conn);
        if (data.roles) {
            for (const [role, roleData] of Object.entries(data.roles)) {
                if (roleData) await repo.upsertRole(personId, role, roleData, conn);
            }
        }
    });
    return repo.findById(personId);
}

async function updateMember(id, data) {
    await getById(id);
    await withTransaction(async (conn) => {
        await repo.updatePerson(id, data, conn);
        if (data.roles) {
            for (const [role, roleData] of Object.entries(data.roles)) {
                if (roleData === null) {
                    await repo.removeRole(id, role, conn);
                } else {
                    await repo.upsertRole(id, role, roleData, conn);
                }
            }
        }
    });
    return repo.findById(id);
}

async function deleteMember(id) {
    await getById(id);
    await repo.removePerson(id);
}

// ---------- Roles dedicados (T5: POST/PUT/DELETE /membros/:id/roles/:role) ----------

async function addRole(id, role, data) {
    await getById(id);
    if (await repo.hasRole(id, role)) {
        throw new AppError(`Member already has the role "${role}".`, 409);
    }
    await repo.upsertRole(id, role, data);
    const member = await repo.findById(id);
    return { person_id: member.id, role, ...member.roles[role] };
}

async function editRole(id, role, data) {
    await getById(id);
    if (!(await repo.hasRole(id, role))) {
        throw new AppError(`Member does not have the role "${role}".`, 404);
    }
    await repo.upsertRole(id, role, data);
    const member = await repo.findById(id);
    return { person_id: member.id, role, ...member.roles[role] };
}

async function removeRoleFromMember(id, role) {
    await getById(id);
    if (!(await repo.hasRole(id, role))) {
        throw new AppError(`Member does not have the role "${role}".`, 404);
    }
    await repo.removeRole(id, role);
}

module.exports = { getAll, getById, createMember, updateMember, deleteMember, addRole, editRole, removeRoleFromMember };
