const { validationResult } = require('express-validator');

function validate(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        const message = errors.array().map(e => `${e.path}: ${e.msg}`).join('; ');
        return res.status(400).json({ error: 'Bad Request', message, code: 400 });
    }
    next();
}

module.exports = { validate };
