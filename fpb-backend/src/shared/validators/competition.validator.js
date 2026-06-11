const { body, query } = require('express-validator');

const STATUSES = ['scheduled', 'ongoing', 'finished', 'cancelled'];
const GENDERS  = ['male', 'female', 'mixed'];
const LEVELS   = ['national', 'regional', 'district'];

const createRules = [
    body('name').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('Name is required (max 200 chars).'),
    body('season').matches(/^\d{4}\/\d{4}$/).withMessage('Season must be in format YYYY/YYYY.'),
    body('gender').optional().isIn(GENDERS).withMessage(`gender must be one of: ${GENDERS.join(', ')}.`),
    body('age_group').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
    body('level').optional().isIn(LEVELS).withMessage(`level must be one of: ${LEVELS.join(', ')}.`),
    body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}.`),
    body('start_date').optional({ nullable: true }).isDate().withMessage('start_date must be a valid date.'),
    body('end_date').optional({ nullable: true }).isDate().withMessage('end_date must be a valid date.'),
    body('description').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
];

const updateRules = [
    body('name').optional().isString().trim().notEmpty().isLength({ max: 200 }),
    body('season').optional().matches(/^\d{4}\/\d{4}$/),
    body('gender').optional().isIn(GENDERS),
    body('age_group').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
    body('level').optional().isIn(LEVELS),
    body('status').optional().isIn(STATUSES),
    body('start_date').optional({ nullable: true }).isDate(),
    body('end_date').optional({ nullable: true }).isDate(),
    body('description').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
];

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('season').optional().matches(/^\d{4}\/\d{4}$/),
    query('status').optional().isIn(STATUSES),
];

module.exports = { createRules, updateRules, listRules };
