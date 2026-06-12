const { Router } = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const ctrl = require('./associations.controller');

// Associações pertencem ao grupo "Clubes, Equipas e Associações" (T4 — Grupo 1),
// pelo que a gestão é gated pela área de permissões 'clubs' (CU22 define 6 áreas fixas).

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('search').optional().isString().trim().isLength({ max: 100 }),
];

const nameRules = [
    body('name').isString().trim().notEmpty().isLength({ max: 200 }).withMessage('Name is required (max 200 chars).'),
];

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('clubs', 'create'), nameRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('clubs', 'edit'), nameRules, validate, ctrl.update);
router.delete('/:id', authenticate, requirePermission('clubs', 'delete'), ctrl.remove);

module.exports = router;
