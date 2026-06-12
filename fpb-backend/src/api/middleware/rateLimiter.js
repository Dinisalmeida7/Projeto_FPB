const rateLimit = require('express-rate-limit');

// Limite estrito no login — proteção contra força bruta de credenciais.
const windowMin = parseInt(process.env.RATE_LIMIT_WINDOW_MIN) || 15;
const loginLimiter = rateLimit({
    windowMs: windowMin * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_MAX) || 10,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too Many Requests', message: `Too many login attempts. Try again in ${windowMin} minutes.`, code: 429 },
    skipSuccessfulRequests: true,
});

// Limite global da API — proteção contra abuso/scraping dos endpoints públicos (RNF02).
// Folgado o suficiente para uso normal de um frontend; configurável por ambiente.
const globalWindowMin = parseInt(process.env.RATE_LIMIT_GLOBAL_WINDOW_MIN) || 15;
const apiLimiter = rateLimit({
    windowMs: globalWindowMin * 60 * 1000,
    max: parseInt(process.env.RATE_LIMIT_GLOBAL_MAX) || 1000,
    standardHeaders: true,
    legacyHeaders: false,
    message: { error: 'Too Many Requests', message: `Request limit exceeded. Try again in ${globalWindowMin} minutes.`, code: 429 },
});

module.exports = { loginLimiter, apiLimiter };
