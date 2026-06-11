const AppError = require('../../shared/utils/AppError');
const repo = require('./games.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const game = await repo.findById(id);
    if (!game) throw new AppError('Game not found.', 404);
    return game;
}

async function createGame(data) {
    if (String(data.home_team_id) === String(data.away_team_id)) {
        throw new AppError('Home and away teams must be different.', 400);
    }
    return repo.create(data);
}

async function updateGame(id, data) {
    await getById(id);
    return repo.update(id, data);
}

async function deleteGame(id) {
    await getById(id);
    await repo.remove(id);
}

module.exports = { getAll, getById, createGame, updateGame, deleteGame };
