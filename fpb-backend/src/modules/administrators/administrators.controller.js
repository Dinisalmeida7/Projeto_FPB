const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const AppError = require('../../shared/utils/AppError');
const svc = require('./administrators.service');

// O gating por área ('administrators') é feito nas rotas via requirePermission /
// requireAreaAccess. Aqui ficam apenas os guards de anti-escalação de privilégios,
// que dependem do alvo e do conteúdo do pedido.

const getAll = asyncHandler(async (req, res) => {
    const { page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const create = asyncHandler(async (req, res) => {
    // Apenas super-admins podem criar outros super-admins
    if (req.body.is_superadmin && !req.admin.is_superadmin) {
        throw new AppError('Only super-admins can grant super-admin status.', 403);
    }
    const admin = await svc.createAdmin(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Administrator', admin.id, { email: admin.email }, req.ip);
    return success(res, admin, 201);
});

const update = asyncHandler(async (req, res) => {
    const target = await svc.getById(req.params.id);

    if (!req.admin.is_superadmin) {
        // Não-super não pode tocar em contas super-admin nem promover ninguém (incluindo a si próprio)
        if (target.is_superadmin) {
            throw new AppError('Only super-admins can modify a super-admin account.', 403);
        }
        if (req.body.is_superadmin !== undefined || req.body.is_active !== undefined) {
            throw new AppError('Only super-admins can change is_superadmin or is_active.', 403);
        }
    }

    const admin = await svc.updateAdmin(req.params.id, req.body);
    const { password: _pw, ...auditBody } = req.body;
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Administrator', admin.id, auditBody, req.ip);
    return success(res, admin);
});

const remove = asyncHandler(async (req, res) => {
    const target = await svc.getById(req.params.id);
    if (target.is_superadmin && !req.admin.is_superadmin) {
        throw new AppError('Only super-admins can deactivate a super-admin account.', 403);
    }
    await svc.deleteAdmin(req.params.id, req.admin.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Administrator', parseInt(req.params.id), { deactivated: true }, req.ip);
    return res.status(204).end();
});

const getPermissions = asyncHandler(async (req, res) => {
    return success(res, await svc.getPermissions(req.params.id));
});

const setPermissions = asyncHandler(async (req, res) => {
    if (!req.admin.is_superadmin) {
        // Editar as próprias permissões seria escalação direta de privilégios
        if (req.admin.id === parseInt(req.params.id)) {
            throw new AppError('Cannot change your own permissions.', 403);
        }
        const target = await svc.getById(req.params.id);
        if (target.is_superadmin) {
            throw new AppError('Only super-admins can change a super-admin\'s permissions.', 403);
        }
    }
    const perms = await svc.setPermissions(req.params.id, req.body.permissions);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Permission', parseInt(req.params.id), { permissions: req.body.permissions }, req.ip);
    return success(res, perms);
});

const getLogs = asyncHandler(async (req, res) => {
    const { admin_id, action, entity, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getLogs({ admin_id, action, entity, page, limit });
    return paginate(res, rows, total, page, limit);
});

module.exports = { getAll, getById, create, update, remove, getPermissions, setPermissions, getLogs };
