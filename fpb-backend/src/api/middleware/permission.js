const AppError = require('../../shared/utils/AppError');
const { query } = require('../../infrastructure/database/connection');

// Whitelist de colunas: `action` vem sempre do código (rotas), nunca do pedido,
// mas o nome da coluna não pode ser um placeholder `?` em prepared statements.
const ACTION_COLUMNS = {
    create: 'can_create',
    edit: 'can_edit',
    delete: 'can_delete',
};

function requirePermission(area, action) {
    const column = ACTION_COLUMNS[action];
    if (!column) {
        throw new Error(`requirePermission: unknown action "${action}"`);
    }

    return async (req, res, next) => {
        if (req.admin.is_superadmin) return next();

        const [perm] = await query(
            `SELECT ${column} FROM Permission WHERE admin_id = ? AND area = ?`,
            [req.admin.id, area]
        );

        if (!perm || !perm[column]) {
            return next(new AppError(`Permission denied: cannot ${action} in ${area}.`, 403));
        }

        next();
    };
}

// Acesso de leitura a uma área administrativa: super-admin ou qualquer permissão na área.
function requireAreaAccess(area) {
    return async (req, res, next) => {
        if (req.admin.is_superadmin) return next();

        const [perm] = await query(
            'SELECT id FROM Permission WHERE admin_id = ? AND area = ? AND (can_create = 1 OR can_edit = 1 OR can_delete = 1)',
            [req.admin.id, area]
        );

        if (!perm) {
            return next(new AppError(`Permission denied: no access to ${area}.`, 403));
        }

        next();
    };
}

module.exports = { requirePermission, requireAreaAccess };
