const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const ctrl = require('./games.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('games', 'create'), ctrl.create);
router.put('/:id', authenticate, requirePermission('games', 'edit'), ctrl.update);
router.delete('/:id', authenticate, requirePermission('games', 'delete'), ctrl.remove);

module.exports = router;
