const { body, query } = require('express-validator');

const currentYear = new Date().getFullYear();

const createRules = [
    body('name').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('Name is required (max 200 chars).'),
    body('short_name').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
    body('acronym').optional({ nullable: true }).isString().trim().isLength({ max: 10 }),
    body('city').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('district').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('founded_year').optional({ nullable: true }).isInt({ min: 1800, max: currentYear }).withMessage(`founded_year must be between 1800 and ${currentYear}.`),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('phone').optional({ nullable: true }).isString().trim().isLength({ max: 30 }),
    body('website').optional({ nullable: true }).isURL().withMessage('website must be a valid URL.'),
    body('address').optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
];

const updateRules = [
    body('name').optional().isString().trim().notEmpty().isLength({ max: 200 }),
    body('short_name').optional({ nullable: true }).isString().trim().isLength({ max: 20 }),
    body('acronym').optional({ nullable: true }).isString().trim().isLength({ max: 10 }),
    body('city').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('district').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    body('founded_year').optional({ nullable: true }).isInt({ min: 1800, max: currentYear }),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('phone').optional({ nullable: true }).isString().trim().isLength({ max: 30 }),
    body('website').optional({ nullable: true }).isURL(),
    body('address').optional({ nullable: true }).isString().trim().isLength({ max: 500 }),
    body('is_active').optional().isBoolean(),
];

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
];

module.exports = { createRules, updateRules, listRules };
