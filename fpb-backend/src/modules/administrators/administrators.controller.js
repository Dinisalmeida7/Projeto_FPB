const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const AppError = require('../../shared/utils/AppError');
const svc = require('./administrators.service');

const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const create = asyncHandler(async (req, res) => {
    if (!req.admin.is_superadmin) throw new AppError('Only super-admins can create administrators.', 403);
    const admin = await svc.createAdmin(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Administrator', admin.id, { email: admin.email }, req.ip);
    return success(res, admin, 201);
});

const update = asyncHandler(async (req, res) => {
    if (!req.admin.is_superadmin && req.admin.id !== parseInt(req.params.id)) {
        throw new AppError('Permission denied.', 403);
    }
    const admin = await svc.updateAdmin(req.params.id, req.body);
    const { password: _pw, ...auditBody } = req.body;
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Administrator', admin.id, auditBody, req.ip);
    return success(res, admin);
});

const remove = asyncHandler(async (req, res) => {
    if (!req.admin.is_superadmin) throw new AppError('Only super-admins can delete administrators.', 403);
    await svc.deleteAdmin(req.params.id, req.admin.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Administrator', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

const setPermissions = asyncHandler(async (req, res) => {
    if (!req.admin.is_superadmin) throw new AppError('Only super-admins can manage permissions.', 403);
    const perms = await svc.setPermissions(req.params.id, req.body.permissions);
    return success(res, perms);
});

module.exports = { getAll, getById, create, update, remove, setPermissions };
