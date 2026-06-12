const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission, requireAreaAccess } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, permissionsRules } = require('../../shared/validators/administrator.validator');
const ctrl = require('./administrators.controller');

// Permite o acesso ao próprio registo; caso contrário aplica o middleware de permissão.
function selfOr(middleware) {
    return (req, res, next) => {
        if (req.admin.id === parseInt(req.params.id)) return next();
        return middleware(req, res, next);
    };
}

const router = Router();

router.use(authenticate);

router.get('/', requireAreaAccess('administrators'), ctrl.getAll);
router.get('/:id', selfOr(requireAreaAccess('administrators')), ctrl.getById);
router.post('/', requirePermission('administrators', 'create'), createRules, validate, ctrl.create);
router.put('/:id', selfOr(requirePermission('administrators', 'edit')), updateRules, validate, ctrl.update);
router.delete('/:id', requirePermission('administrators', 'delete'), ctrl.remove);
router.get('/:id/permissions', selfOr(requireAreaAccess('administrators')), ctrl.getPermissions);
router.put('/:id/permissions', requirePermission('administrators', 'edit'), permissionsRules, validate, ctrl.setPermissions);

module.exports = router;
