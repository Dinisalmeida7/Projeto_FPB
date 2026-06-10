const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./members.service');

const getAll = asyncHandler(async (req, res) => {
    const { search, role, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ search, role, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    const member = await svc.getById(req.params.id);
    return success(res, member);
});

const create = asyncHandler(async (req, res) => {
    const member = await svc.createMember(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Person', member.id, { name: `${member.first_name} ${member.last_name}` }, req.ip);
    return success(res, member, 201);
});

const update = asyncHandler(async (req, res) => {
    const member = await svc.updateMember(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Person', member.id, req.body, req.ip);
    return success(res, member);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteMember(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Person', parseInt(req.params.id), null, req.ip);
    return success(res, { message: 'Member deleted.' });
});

module.exports = { getAll, getById, create, update, remove };
