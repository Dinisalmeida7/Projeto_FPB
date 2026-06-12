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
    query('category_id').optional().isInt({ min: 1 }).toInt(),
];

const createRules = [
    body('title').isString().trim().notEmpty().isLength({ max: 300 }).withMessage('Title is required (max 300 chars).'),
    body('description').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
    body('category_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    body('published_date').optional({ nullable: true }).isDate().withMessage('published_date must be a valid date (YYYY-MM-DD).'),
];

const updateRules = [
    body('title').optional().isString().trim().notEmpty().isLength({ max: 300 }),
    body('description').optional({ nullable: true }).isString().trim().isLength({ max: 2000 }),
    body('category_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
    body('published_date').optional({ nullable: true }).isDate(),
];

const categoryRules = [
    body('name').isString().trim().notEmpty().isLength({ max: 100 }).withMessage('Category name is required (max 100 chars).'),
];

const router = Router();

// /categories tem de ser registado ANTES de /:id para o Express não capturar
// "categories" como um id de documento.
router.get('/categories', ctrl.getCategories);
router.post('/categories', authenticate, requirePermission('documents', 'create'), categoryRules, validate, ctrl.createCategory);
router.put('/categories/:id', authenticate, requirePermission('documents', 'edit'), categoryRules, validate, ctrl.updateCategory);
router.delete('/categories/:id', authenticate, requirePermission('documents', 'delete'), ctrl.removeCategory);

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/download', ctrl.download);

router.post('/', authenticate, requirePermission('documents', 'create'), upload.single('file'), createRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('documents', 'edit'), updateRules, validate, ctrl.update);
router.delete('/:id', authenticate, requirePermission('documents', 'delete'), ctrl.remove);

module.exports = router;
