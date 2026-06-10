const AppError = require('../../shared/utils/AppError');
const { query } = require('../../infrastructure/database/connection');

function requirePermission(area, action) {
    return async (req, res, next) => {
        if (req.admin.is_superadmin) return next();

        const [perm] = await query(
            'SELECT ?? FROM Permission WHERE admin_id = ? AND area = ?',
            [`can_${action}`, req.admin.id, area]
        );

        if (!perm || !perm[`can_${action}`]) {
            return next(new AppError(`Permission denied: cannot ${action} in ${area}.`, 403));
        }

        next();
    };
}

module.exports = { requirePermission };
