const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const ctrl = require('./clubs.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('clubs', 'create'), ctrl.create);
router.put('/:id', authenticate, requirePermission('clubs', 'edit'), ctrl.update);
router.delete('/:id', authenticate, requirePermission('clubs', 'delete'), ctrl.remove);

module.exports = router;
