const { body, query } = require('express-validator');

const STATUSES = ['Agendado', 'Em curso', 'Realizado', 'Adiado', 'Cancelado'];

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

const resultRules = [
    body('score_home').isInt({ min: 0 }).withMessage('score_home must be a non-negative integer.'),
    body('score_away').isInt({ min: 0 }).withMessage('score_away must be a non-negative integer.'),
];

// Nomeação de juízes (T5: POST /jogos/:id/juizes — CU19)
const refereeRules = [
    body('referee_id').isInt({ min: 1 }).withMessage('referee_id must be a positive integer.'),
    body('role').optional().isIn(['main', 'assistant', 'table']).withMessage('role must be one of: main, assistant, table.'),
];

// Participação/estatísticas de atletas (T5: POST/PUT /jogos/:id/atletas — T4: AtletaJogo)
const STAT_FIELDS = [
    body('points').optional().isInt({ min: 0, max: 65535 }).withMessage('points must be a non-negative integer.'),
    body('rebounds').optional().isInt({ min: 0, max: 65535 }).withMessage('rebounds must be a non-negative integer.'),
    body('assists').optional().isInt({ min: 0, max: 65535 }).withMessage('assists must be a non-negative integer.'),
    body('minutes_played').optional().isInt({ min: 0, max: 255 }).withMessage('minutes_played must be between 0 and 255.'),
];

const athleteCreateRules = [
    body('athlete_id').isInt({ min: 1 }).withMessage('athlete_id must be a positive integer.'),
    ...STAT_FIELDS,
];

const athleteUpdateRules = [...STAT_FIELDS];

module.exports = { createRules, updateRules, listRules, resultRules, refereeRules, athleteCreateRules, athleteUpdateRules };
