const { Router } = require('express');
const { param } = require('express-validator');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, listRules, roleBodyRules, ROLES } = require('../../shared/validators/member.validator');
const ctrl = require('./members.controller');

const roleParamRule = param('role').isIn(ROLES).withMessage(`role must be one of: ${ROLES.join(', ')}.`);

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('members', 'create'), createRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('members', 'edit'), updateRules, validate, ctrl.update);
router.delete('/:id', authenticate, requirePermission('members', 'delete'), ctrl.remove);

// Roles dedicados (T5: /membros/:id/roles/:role)
router.post('/:id/roles/:role', authenticate, requirePermission('members', 'edit'), roleParamRule, roleBodyRules, validate, ctrl.addRole);
router.put('/:id/roles/:role', authenticate, requirePermission('members', 'edit'), roleParamRule, roleBodyRules, validate, ctrl.updateRole);
router.delete('/:id/roles/:role', authenticate, requirePermission('members', 'edit'), roleParamRule, validate, ctrl.removeRole);

module.exports = router;
