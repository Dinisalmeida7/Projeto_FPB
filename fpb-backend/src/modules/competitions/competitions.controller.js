const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./competitions.service');

const getAll = asyncHandler(async (req, res) => {
    const { search, season, status, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ search, season, status, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const getStandings = asyncHandler(async (req, res) => {
    return success(res, await svc.getStandings(req.params.id));
});

const create = asyncHandler(async (req, res) => {
    const c = await svc.createCompetition(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Competition', c.id, { name: c.name }, req.ip);
    return success(res, c, 201);
});

const update = asyncHandler(async (req, res) => {
    const c = await svc.updateCompetition(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Competition', c.id, req.body, req.ip);
    return success(res, c);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteCompetition(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Competition', parseInt(req.params.id), null, req.ip);
    return success(res, { message: 'Competition deleted.' });
});

const addTeam = asyncHandler(async (req, res) => {
    await svc.addTeam(req.params.id, req.body.team_id);
    return success(res, { message: 'Team added to competition.' });
});

const removeTeam = asyncHandler(async (req, res) => {
    await svc.removeTeam(req.params.id, req.params.teamId);
    return success(res, { message: 'Team removed from competition.' });
});

module.exports = { getAll, getById, getStandings, create, update, remove, addTeam, removeTeam };
