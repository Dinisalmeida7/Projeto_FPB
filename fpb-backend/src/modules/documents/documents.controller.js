const path = require('path');
const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./documents.service');

const getAll = asyncHandler(async (req, res) => {
    const { category, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ category, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const download = asyncHandler(async (req, res) => {
    const doc = await svc.getById(req.params.id);
    return res.download(path.resolve(doc.file_path), doc.file_name);
});

const create = asyncHandler(async (req, res) => {
    const doc = await svc.createDocument(req.file, req.body, req.admin.id);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Document', doc.id, { title: doc.title }, req.ip);
    return success(res, doc, 201);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteDocument(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Document', parseInt(req.params.id), null, req.ip);
    return success(res, { message: 'Document deleted.' });
});

module.exports = { getAll, getById, download, create, remove };
