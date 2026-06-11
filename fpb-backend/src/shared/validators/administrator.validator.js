const { body } = require('express-validator');

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&._-])/;

const createRules = [
    body('name').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('Name is required (max 200 chars).'),
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required.'),
    body('password')
        .isLength({ min: 8, max: 128 }).withMessage('Password must be 8-128 characters.')
        .matches(PASSWORD_REGEX).withMessage('Password must contain uppercase, lowercase, digit and special character (@$!%*?&._-).'),
    body('is_superadmin').optional().isBoolean(),
];

const updateRules = [
    body('name').optional().isString().trim().notEmpty().isLength({ max: 200 }),
    body('email').optional().isEmail().normalizeEmail(),
    body('password')
        .optional()
        .isLength({ min: 8, max: 128 })
        .matches(PASSWORD_REGEX).withMessage('Password must contain uppercase, lowercase, digit and special character.'),
    body('is_superadmin').optional().isBoolean(),
    body('is_active').optional().isBoolean(),
];

const permissionsRules = [
    body('permissions').isArray({ min: 1 }).withMessage('permissions must be a non-empty array.'),
    body('permissions.*.area')
        .isIn(['clubs', 'competitions', 'games', 'members', 'documents', 'administrators'])
        .withMessage('Invalid area.'),
    body('permissions.*.can_create').isBoolean(),
    body('permissions.*.can_edit').isBoolean(),
    body('permissions.*.can_delete').isBoolean(),
];

module.exports = { createRules, updateRules, permissionsRules };
