const { Router } = require('express');
const { query } = require('express-validator');
const { authenticate } = require('../../api/middleware/auth');
const { requireAreaAccess } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const ctrl = require('./administrators.controller');

// T5: GET /api/v1/logs — consulta do log de auditoria (RF35).
// Acesso: super-admin ou qualquer permissão na área 'administrators'.
const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('admin_id').optional().isInt({ min: 1 }).toInt(),
    query('action').optional().isIn(['CREATE', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT']),
    query('entity').optional().isString().trim().isLength({ max: 100 }),
];

const router = Router();

router.get('/', authenticate, requireAreaAccess('administrators'), listRules, validate, ctrl.getLogs);

module.exports = router;
