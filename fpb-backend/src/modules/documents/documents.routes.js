const { Router } = require('express');
const { body, query } = require('express-validator');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { upload } = require('../../infrastructure/storage/storage');
const ctrl = require('./documents.controller');

const listRules = [
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
    query('category').optional().isString().trim().isLength({ max: 100 }),
];

const createRules = [
    body('title').isString().trim().notEmpty().isLength({ max: 300 }).withMessage('Title is required (max 300 chars).'),
    body('description').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
    body('category').optional({ nullable: true }).isString().trim().isLength({ max: 100 }),
];

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.download);

router.post('/', authenticate, requirePermission('documents', 'create'), upload.single('file'), createRules, validate, ctrl.create);
router.delete('/:id', authenticate, requirePermission('documents', 'delete'), ctrl.remove);

module.exports = router;
