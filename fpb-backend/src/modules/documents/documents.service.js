const AppError = require('../../shared/utils/AppError');
const { deleteFile } = require('../../infrastructure/storage/storage');
const repo = require('./documents.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const doc = await repo.findById(id);
    if (!doc) throw new AppError('Document not found.', 404);
    return doc;
}

async function createDocument(file, body, adminId) {
    if (!file) throw new AppError('File is required.', 400);
    if (!body.title) throw new AppError('Title is required.', 400);

    return repo.create({
        title: body.title,
        description: body.description,
        category: body.category,
        file_path: file.path,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: adminId,
    });
}

async function deleteDocument(id) {
    const doc = await getById(id);
    deleteFile(doc.file_path);
    await repo.remove(id);
}

module.exports = { getAll, getById, createDocument, deleteDocument };
