const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const ctrl = require('./administrators.controller');

const router = Router();

router.use(authenticate);

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.post('/', ctrl.create);
router.put('/:id', ctrl.update);
router.delete('/:id', ctrl.remove);
router.put('/:id/permissions', ctrl.setPermissions);

module.exports = router;
