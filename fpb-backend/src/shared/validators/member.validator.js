const { body, query } = require('express-validator');

const ROLES = ['athlete', 'referee', 'coach', 'fpbmember'];

// Regras de validação para os dados de cada role (T4: Atleta, Juiz, Treinador, MembroFPB).
// Usadas tanto no body embutido (`roles.athlete.*`) como nos endpoints dedicados de roles.
function roleDataRules(prefix) {
    return [
        body(`${prefix}license_number`).optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
        body(`${prefix}position`).optional({ nullable: true }).isIn(['PG', 'SG', 'SF', 'PF', 'C']),
        body(`${prefix}jersey_number`).optional({ nullable: true }).isInt({ min: 0, max: 255 }),
        body(`${prefix}height_cm`).optional({ nullable: true }).isInt({ min: 0, max: 300 }),
        body(`${prefix}weight_kg`).optional({ nullable: true }).isFloat({ min: 0, max: 500 }),
        body(`${prefix}level`).optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
        body(`${prefix}type`).optional({ nullable: true }).isIn(['Árbitro', 'Oficial de Mesa']),
        body(`${prefix}association_id`).optional({ nullable: true }).isInt({ min: 1 }),
        body(`${prefix}member_number`).optional({ nullable: true }).isString().trim().isLength({ max: 50 }),
        body(`${prefix}role_description`).optional({ nullable: true }).isString().trim().isLength({ max: 200 }),
        body(`${prefix}is_active`).optional({ nullable: true }).isBoolean(),
    ];
}

const rolesRules = [
    body('roles').optional().isObject().withMessage('roles must be an object.'),
    body('roles.*').optional({ nullable: true }).custom((value, { path }) => {
        const role = path.match(/roles\.(\w+)/)?.[1];
        if (role && !ROLES.includes(role)) throw new Error(`Unknown role "${role}". Valid: ${ROLES.join(', ')}.`);
        if (value !== null && (typeof value !== 'object' || Array.isArray(value))) {
            throw new Error('Each role entry must be an object or null.');
        }
        return true;
    }),
    ...ROLES.flatMap(r => roleDataRules(`roles.${r}.`)),
];

const createRules = [
    body('first_name').isString().trim().notEmpty().isLength({ max: 100 }).withMessage('first_name is required (max 100 chars).'),
    body('last_name').isString().trim().notEmpty().isLength({ max: 100 }).withMessage('last_name is required (max 100 chars).'),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('birth_date').optional({ nullable: true }).isDate().withMessage('birth_date must be a valid date (YYYY-MM-DD).'),
    body('nationality').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    ...rolesRules,
];

const updateRules = [
    body('first_name').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('last_name').optional().isString().trim().notEmpty().isLength({ max: 100 }),
    body('email').optional({ nullable: true }).isEmail().normalizeEmail(),
    body('birth_date').optional({ nullable: true }).isDate(),
    body('nationality').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
    ...rolesRules,
];

// Endpoints dedicados POST/PUT /members/:id/roles/:role — dados do role na raiz do body
const roleBodyRules = roleDataRules('');

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
    query('role').optional().isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}.`),
];

module.exports = { createRules, updateRules, listRules, roleBodyRules, ROLES };
