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

module.exports = { getAll, getById, create, update, registerResult, remove };
