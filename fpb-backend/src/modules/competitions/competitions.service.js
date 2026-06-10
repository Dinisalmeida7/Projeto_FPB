const AppError = require('../../shared/utils/AppError');
const repo = require('./competitions.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const c = await repo.findById(id);
    if (!c) throw new AppError('Competition not found.', 404);
    return c;
}

async function getStandings(id) {
    await getById(id);
    return repo.getStandings(id);
}

async function createCompetition(data) {
    if (!data.name || !data.season) throw new AppError('name and season are required.', 400);
    return repo.create(data);
}

async function updateCompetition(id, data) {
    await getById(id);
    return repo.update(id, data);
}

async function deleteCompetition(id) {
    await getById(id);
    await repo.remove(id);
}

async function addTeam(competitionId, teamId) {
    await getById(competitionId);
    await repo.addTeam(competitionId, teamId);
}

async function removeTeam(competitionId, teamId) {
    await getById(competitionId);
    await repo.removeTeam(competitionId, teamId);
}

module.exports = { getAll, getById, getStandings, createCompetition, updateCompetition, deleteCompetition, addTeam, removeTeam };
