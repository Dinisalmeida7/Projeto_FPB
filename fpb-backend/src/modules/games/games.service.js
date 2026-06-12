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

// Registar resultado: grava o placar, marca o jogo como 'Realizado' e devolve
// classificacao_atualizada:true — a classificação é dinâmica, logo reflete o novo
// resultado imediatamente (sem risco de contar o jogo duas vezes).
async function registerResult(id, data) {
    await getById(id);
    const game = await repo.update(id, {
        score_home: data.score_home,
        score_away: data.score_away,
        status: 'Realizado',
    });
    return { ...game, classificacao_atualizada: true };
}

async function deleteGame(id) {
    await getById(id);
    await repo.remove(id);
}

// ---------- Juízes (CU19 — nomeação de juízes para jogos) ----------

async function addReferee(gameId, refereeId, role) {
    await getById(gameId);
    const referee = await repo.findRefereeById(refereeId);
    if (!referee) throw new AppError('Referee not found.', 404);
    if (!referee.is_active) throw new AppError('Referee is not active.', 400);

    await repo.addReferee(gameId, refereeId, role); // duplicado → ER_DUP_ENTRY → 409
    return {
        game_id: Number(gameId),
        referee_id: referee.id,
        referee_name: `${referee.first_name} ${referee.last_name}`,
        type: referee.type,
        role: role || 'main',
    };
}

async function removeReferee(gameId, refereeId) {
    await getById(gameId);
    const removed = await repo.removeReferee(gameId, refereeId);
    if (!removed) throw new AppError('Referee is not assigned to this game.', 404);
}

// ---------- Atletas (T4: AtletaJogo — participação e estatísticas) ----------

async function addAthlete(gameId, data) {
    await getById(gameId);
    const athlete = await repo.findAthleteById(data.athlete_id);
    if (!athlete) throw new AppError('Athlete not found.', 404);

    const existing = await repo.findGameAthlete(gameId, data.athlete_id);
    if (existing) throw new AppError('Athlete is already registered in this game.', 409);

    return repo.addAthlete(gameId, data.athlete_id, data);
}

async function updateAthleteStats(gameId, athleteId, data) {
    await getById(gameId);
    const existing = await repo.findGameAthlete(gameId, athleteId);
    if (!existing) throw new AppError('Athlete is not registered in this game.', 404);

    return repo.updateAthleteStats(gameId, athleteId, data);
}

async function removeAthlete(gameId, athleteId) {
    await getById(gameId);
    const removed = await repo.removeAthlete(gameId, athleteId);
    if (!removed) throw new AppError('Athlete is not registered in this game.', 404);
}

module.exports = {
    getAll, getById, createGame, updateGame, registerResult, deleteGame,
    addReferee, removeReferee,
    addAthlete, updateAthleteStats, removeAthlete,
};
