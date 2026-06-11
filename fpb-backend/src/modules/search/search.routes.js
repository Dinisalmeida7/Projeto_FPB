const { Router } = require('express');
const { query: qv } = require('express-validator');
const { validate } = require('../../api/middleware/validate');
const { search } = require('./search.controller');

const VALID_TYPES = ['all', 'clubs', 'members', 'competitions', 'games'];

const searchRules = [
    qv('q').isString().trim().isLength({ min: 2, max: 100 }).withMessage('q must be between 2 and 100 characters.'),
    qv('type').optional().isIn(VALID_TYPES).withMessage(`type must be one of: ${VALID_TYPES.join(', ')}.`),
    qv('page').optional().isInt({ min: 1 }).toInt(),
    qv('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
];

const router = Router();
router.get('/', searchRules, validate, search);

module.exports = router;
