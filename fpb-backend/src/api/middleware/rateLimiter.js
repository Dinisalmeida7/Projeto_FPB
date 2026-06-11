const rateLimit = require('express-rate-limit');

const windowMin = parseInt(process.env.RATE_LIMIT_WINDOW_MIN) || 15;
const loginLimiter = rateLimit({
    windowMs: windowMin * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { success: false, error: `Too many login attempts. Try again in ${windowMin} minutes.` },
    skipSuccessfulRequests: true,
});

module.exports = { loginLimiter };
