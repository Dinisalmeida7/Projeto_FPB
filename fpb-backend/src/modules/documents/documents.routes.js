const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { upload } = require('../../infrastructure/storage/storage');
const ctrl = require('./documents.controller');

const router = Router();

router.get('/', ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.download);

router.post('/', authenticate, requirePermission('documents', 'create'), upload.single('file'), ctrl.create);
router.delete('/:id', authenticate, requirePermission('documents', 'delete'), ctrl.remove);

module.exports = router;
