const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, listRules } = require('../../shared/validators/member.validator');
const ctrl = require('./members.controller');

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('members', 'create'), createRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('members', 'edit'), updateRules, validate, ctrl.update);
router.delete('/:id', authenticate, requirePermission('members', 'delete'), ctrl.remove);

module.exports = router;
