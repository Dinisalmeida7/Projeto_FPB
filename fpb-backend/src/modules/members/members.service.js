const AppError = require('../../shared/utils/AppError');
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
    if (!data.first_name || !data.last_name) {
        throw new AppError('first_name and last_name are required.', 400);
    }
    const id = await repo.createPerson(data);

    if (data.roles) {
        for (const [role, roleData] of Object.entries(data.roles)) {
            if (roleData) await repo.upsertRole(id, role, roleData);
        }
    }

    return repo.findById(id);
}

async function updateMember(id, data) {
    await getById(id);
    await repo.updatePerson(id, data);

    if (data.roles) {
        for (const [role, roleData] of Object.entries(data.roles)) {
            if (roleData === null) {
                await repo.removeRole(id, role);
            } else {
                await repo.upsertRole(id, role, roleData);
            }
        }
    }

    return repo.findById(id);
}

async function deleteMember(id) {
    await getById(id);
    await repo.removePerson(id);
}

module.exports = { getAll, getById, createMember, updateMember, deleteMember };
