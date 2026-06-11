const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./clubs.service');

const getAll = asyncHandler(async (req, res) => {
    const { search, district, is_active, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ search, district, is_active, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    const club = await svc.getById(req.params.id);
    return success(res, club);
});

const create = asyncHandler(async (req, res) => {
    const club = await svc.createClub(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Club', club.id, { name: club.name }, req.ip);
    return success(res, club, 201);
});

const update = asyncHandler(async (req, res) => {
    const club = await svc.updateClub(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Club', club.id, req.body, req.ip);
    return success(res, club);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteClub(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Club', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

module.exports = { getAll, getById, create, update, remove };
