const AppError = require('../../shared/utils/AppError');
const repo = require('./associations.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const association = await repo.findById(id);
    if (!association) throw new AppError('Association not found.', 404);
    return association;
}

async function createAssociation(name) {
    return repo.create(name); // nome duplicado → ER_DUP_ENTRY → 409
}

async function updateAssociation(id, name) {
    await getById(id);
    return repo.update(id, name);
}

async function deleteAssociation(id) {
    await getById(id);
    await repo.remove(id);
}

module.exports = { getAll, getById, createAssociation, updateAssociation, deleteAssociation };
