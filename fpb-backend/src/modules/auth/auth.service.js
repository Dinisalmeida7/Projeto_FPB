const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const AppError = require('../../shared/utils/AppError');
const { findAdminByEmail, updateLastLogin } = require('./auth.repository');

async function login(email, password) {
    const admin = await findAdminByEmail(email);
    if (!admin || !admin.is_active) {
        throw new AppError('Invalid credentials.', 401);
    }

    const match = await bcrypt.compare(password, admin.password);
    if (!match) {
        throw new AppError('Invalid credentials.', 401);
    }

    await updateLastLogin(admin.id);

    const token = jwt.sign(
        { id: admin.id, email: admin.email, is_superadmin: admin.is_superadmin },
        process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return {
        token,
        admin: {
            id: admin.id,
            name: admin.name,
            email: admin.email,
            is_superadmin: admin.is_superadmin,
        },
    };
}

module.exports = { login };
