const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./associations.service');

const getAll = asyncHandler(async (req, res) => {
    const { search, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ search, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const create = asyncHandler(async (req, res) => {
    const association = await svc.createAssociation(req.body.name);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Association', association.id, { name: association.name }, req.ip);
    return success(res, association, 201);
});

const update = asyncHandler(async (req, res) => {
    const association = await svc.updateAssociation(req.params.id, req.body.name);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Association', association.id, { name: association.name }, req.ip);
    return success(res, association);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteAssociation(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Association', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

module.exports = { getAll, getById, create, update, remove };
