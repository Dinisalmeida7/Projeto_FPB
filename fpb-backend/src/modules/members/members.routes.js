const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const ctrl = require('./members.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('members', 'create'), ctrl.create);
router.put('/:id', authenticate, requirePermission('members', 'edit'), ctrl.update);
router.delete('/:id', authenticate, requirePermission('members', 'delete'), ctrl.remove);

module.exports = router;
