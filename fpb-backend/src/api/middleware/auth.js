const jwt = require('jsonwebtoken');
const AppError = require('../../shared/utils/AppError');
const { query } = require('../../infrastructure/database/connection');

async function authenticate(req, res, next) {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
        return next(new AppError('Authentication token required.', 401));
    }

    const token = header.split(' ')[1];
    let payload;
    try {
        payload = jwt.verify(token, process.env.JWT_SECRET);
    } catch {
        return next(new AppError('Invalid or expired token.', 401));
    }

    const [admin] = await query(
        'SELECT id, name, email, is_superadmin, is_active FROM Administrator WHERE id = ?',
        [payload.id]
    );

    if (!admin || !admin.is_active) {
        return next(new AppError('Administrator not found or inactive.', 401));
    }

    req.admin = admin;
    next();
}

module.exports = { authenticate };
