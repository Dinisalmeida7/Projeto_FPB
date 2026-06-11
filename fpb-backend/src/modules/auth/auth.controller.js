const asyncHandler = require('../../shared/utils/asyncHandler');
const { success } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const { login } = require('./auth.service');

const loginHandler = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    await logAction(result.admin.id, result.admin.email, 'LOGIN', 'Administrator', result.admin.id, null, req.ip);

    return success(res, result, 200);
});

const logoutHandler = asyncHandler(async (req, res) => {
    await logAction(req.admin.id, req.admin.email, 'LOGOUT', 'Administrator', req.admin.id, null, req.ip);
    return success(res, { message: 'Logged out successfully.' });
});

module.exports = { loginHandler, logoutHandler };
