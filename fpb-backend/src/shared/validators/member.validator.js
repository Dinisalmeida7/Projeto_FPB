const { body, query } = require('express-validator');

const ROLES = ['athlete', 'referee', 'coach', 'fpbmember'];

const createRules = [
    body('first_name').isString().trim().notEmpty().isLength({ max: 100 }).withMessage('first_name is required (max 100 chars).'),
    body('last_name').isString().trim().notEmpty().isLength({ max: 100 }).withMessage('last_name is required (max 100 chars).'),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('birth_date').optional({ nullable: true }).isDate().withMessage('birth_date must be a valid date (YYYY-MM-DD).'),
    body('nationality').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
];

const updateRules = [
    body('first_name').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('last_name').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('birth_date').optional({ nullable: true }).isDate(),
    body('nationality').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
];

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
    query('role').optional().isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}.`),
];

module.exports = { createRules, updateRules, listRules };
