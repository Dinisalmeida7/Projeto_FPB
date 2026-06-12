const { body, query } = require('express-validator');

const GENDERS = ['male', 'female', 'mixed'];

const createRules = [
    body('name').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('Name is required (max 200 chars).'),
    body('club_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('club_id must be a positive integer.'),
    body('association_id').optional({ nullable: true }).isInt({ min: 1 }).withMessage('association_id must be a positive integer.'),
    body('gender').optional().isIn(GENDERS).withMessage(`gender must be one of: ${GENDERS.join(', ')}.`),
    body('age_group').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
];

const updateRules = [
    body('name').optional().isString().trim().notEmpty().isLength({ max: 200 }),
    body('club_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('association_id').optional({ nullable: true }).isInt({ min: 1 }),
    body('gender').optional().isIn(GENDERS),
    body('age_group').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
    body('is_active').optional().isBoolean(),
];

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
    query('club_id').optional().isInt({ min: 1 }).toInt(),
    query('association_id').optional().isInt({ min: 1 }).toInt(),
    query('gender').optional().isIn(GENDERS),
    query('age_group').optional().isString().trim().isLength({ max: 50 }),
];

const coachRules = [
    body('coach_id').isInt({ min: 1 }).withMessage('coach_id must be a positive integer.'),
];

const athleteRules = [
    body('athlete_id').isInt({ min: 1 }).withMessage('athlete_id must be a positive integer.'),
    body('season').matches(/^\d{4}\/\d{4}$/).withMessage('season is required in format YYYY/YYYY.'),
    body('jersey_number').optional({ nullable: true }).isInt({ min: 0, max: 255 }),
    body('joined_at').optional({ nullable: true }).isDate().withMessage('joined_at must be a valid date (YYYY-MM-DD).'),
];

module.exports = { createRules, updateRules, listRules, coachRules, athleteRules };
