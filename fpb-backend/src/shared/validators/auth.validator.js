const { body, query } = require('express-validator');

const loginRules = [
    body('email')
        .isEmail().withMessage('Valid email is required.')
        .normalizeEmail()
        .isLength({ max: 255 }),
    body('password')
        .isString().withMessage('Password is required.')
        .notEmpty().withMessage('Password is required.')
        .isLength({ max: 128 }),
];

const paginationRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

module.exports = { loginRules, paginationRules };
