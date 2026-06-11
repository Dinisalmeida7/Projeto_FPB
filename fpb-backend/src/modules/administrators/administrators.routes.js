const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, permissionsRules } = require('../../shared/validators/administrator.validator');
const ctrl = require('./administrators.controller');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', createRules, validate, ctrl.create);
router.put('/:id', updateRules, validate, ctrl.update);
router.delete('/:id', ctrl.remove);
router.put('/:id/permissions', permissionsRules, validate, ctrl.setPermissions);

module.exports = router;
