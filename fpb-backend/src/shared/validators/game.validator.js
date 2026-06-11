const { body, query } = require('express-validator');

const STATUSES = ['scheduled', 'ongoing', 'finished', 'postponed', 'cancelled'];

const createRules = [
    body('competition_id').isInt({ min: 1 }).withMessage('competition_id must be a positive integer.'),
    body('home_team_id').isInt({ min: 1 }).withMessage('home_team_id must be a positive integer.'),
    body('away_team_id').isInt({ min: 1 }).withMessage('away_team_id must be a positive integer.'),
    body('game_date').optional({ nullable: true }).isISO8601().withMessage('game_date must be a valid ISO 8601 datetime.'),
    body('venue').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
    body('round').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
    body('status').optional().isIn(STATUSES).withMessage(`status must be one of: ${STATUSES.join(', ')}.`),
];

const updateRules = [
    body('game_date').optional({ nullable: true }).isISO8601(),
    body('venue').optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
    body('round').optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
    body('score_home').optional({ nullable: true }).isInt({ min: 0 }).withMessage('score_home must be a non-negative integer.'),
    body('score_away').optional({ nullable: true }).isInt({ min: 0 }).withMessage('score_away must be a non-negative integer.'),
    body('status').optional().isIn(STATUSES),
    body('notes').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
];

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('competition_id').optional().isInt({ min: 1 }).toInt(),
    query('team_id').optional().isInt({ min: 1 }).toInt(),
    query('status').optional().isIn(STATUSES),
    query('date_from').optional().isDate(),
    query('date_to').optional().isDate(),
];

module.exports = { createRules, updateRules, listRules };
