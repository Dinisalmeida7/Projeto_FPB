const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./games.service');

const getAll = asyncHandler(async (req, res) => {
    const { competition_id, team_id, status, date_from, date_to, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ competition_id, team_id, status, date_from, date_to, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const create = asyncHandler(async (req, res) => {
    const game = await svc.createGame(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Game', game.id, { competition_id: game.competition_id }, req.ip);
    return success(res, game, 201);
});

const update = asyncHandler(async (req, res) => {
    const game = await svc.updateGame(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Game', game.id, req.body, req.ip);
    return success(res, game);
});

const registerResult = asyncHandler(async (req, res) => {
    const game = await svc.registerResult(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Game', game.id,
        { score_home: game.score_home, score_away: game.score_away, status: game.status }, req.ip);
    return success(res, game);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteGame(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Game', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

// ---------- Juízes ----------

const addReferee = asyncHandler(async (req, res) => {
    const nomination = await svc.addReferee(req.params.id, req.body.referee_id, req.body.role);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'GameReferee', parseInt(req.params.id),
        { referee_id: req.body.referee_id, role: req.body.role || 'main' }, req.ip);
    return success(res, nomination, 201);
});

const removeReferee = asyncHandler(async (req, res) => {
    await svc.removeReferee(req.params.id, req.params.refereeId);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'GameReferee', parseInt(req.params.id),
        { referee_id: parseInt(req.params.refereeId) }, req.ip);
    return res.status(204).end();
});

// ---------- Atletas ----------

const addAthlete = asyncHandler(async (req, res) => {
    const participation = await svc.addAthlete(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'GameAthlete', parseInt(req.params.id),
        { athlete_id: req.body.athlete_id }, req.ip);
    return success(res, participation, 201);
});

const updateAthlete = asyncHandler(async (req, res) => {
    const participation = await svc.updateAthleteStats(req.params.id, req.params.athleteId, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'GameAthlete', parseInt(req.params.id),
        { athlete_id: parseInt(req.params.athleteId), ...req.body }, req.ip);
    return success(res, participation);
});

const removeAthlete = asyncHandler(async (req, res) => {
    await svc.removeAthlete(req.params.id, req.params.athleteId);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'GameAthlete', parseInt(req.params.id),
        { athlete_id: parseInt(req.params.athleteId) }, req.ip);
    return res.status(204).end();
});

module.exports = {
    getAll, getById, create, update, registerResult, remove,
    addReferee, removeReferee, addAthlete, updateAthlete, removeAthlete,
};
