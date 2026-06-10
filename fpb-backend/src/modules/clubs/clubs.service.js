const AppError = require('../../shared/utils/AppError');
const repo = require('./clubs.repository');

async function getAll(filters) {
    return repo.findAll(filters);
}

async function getById(id) {
    const club = await repo.findById(id);
    if (!club) throw new AppError('Club not found.', 404);
    return club;
}

async function createClub(data) {
    if (!data.name) throw new AppError('Club name is required.', 400);
    return repo.create(data);
}

async function updateClub(id, data) {
    await getById(id);
    return repo.update(id, data);
}

async function deleteClub(id) {
    await getById(id);
    await repo.remove(id);
}

module.exports = { getAll, getById, createClub, updateClub, deleteClub };
