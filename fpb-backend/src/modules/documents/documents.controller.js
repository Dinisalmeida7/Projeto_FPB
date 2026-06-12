const fs = require('fs');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const AppError = require('../../shared/utils/AppError');
const svc = require('./documents.service');

const getAll = asyncHandler(async (req, res) => {
    const { category_id, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ category_id, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const download = asyncHandler(async (req, res) => {
    const doc = await svc.getById(req.params.id);
    const abs = svc.resolveFilePath(doc);
    // O registo pode existir sem o ficheiro físico (apagado/movido fora da API)
    if (!fs.existsSync(abs)) {
        throw new AppError('File no longer available on the server.', 404);
    }
    return res.download(abs, doc.file_name);
});

const create = asyncHandler(async (req, res) => {
    const doc = await svc.createDocument(req.file, req.body, req.admin.id);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Document', doc.id, { title: doc.title }, req.ip);
    return success(res, doc, 201);
});

const update = asyncHandler(async (req, res) => {
    const doc = await svc.updateDocument(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Document', doc.id, req.body, req.ip);
    return success(res, doc);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteDocument(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Document', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

// ---------- Categorias ----------

const getCategories = asyncHandler(async (req, res) => {
    return success(res, await svc.getCategories());
});

const createCategory = asyncHandler(async (req, res) => {
    const cat = await svc.createCategory(req.body.name);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'DocumentCategory', cat.id, { name: cat.name }, req.ip);
    return success(res, cat, 201);
});

const updateCategory = asyncHandler(async (req, res) => {
    const cat = await svc.updateCategory(req.params.id, req.body.name);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'DocumentCategory', cat.id, { name: cat.name }, req.ip);
    return success(res, cat);
});

const removeCategory = asyncHandler(async (req, res) => {
    await svc.deleteCategory(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'DocumentCategory', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

module.exports = {
    getAll, getById, download, create, update, remove,
    getCategories, createCategory, updateCategory, removeCategory,
};
