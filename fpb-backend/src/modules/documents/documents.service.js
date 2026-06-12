const path = require('path');
const AppError = require('../../shared/utils/AppError');
const { deleteFile, uploadDir } = require('../../infrastructure/storage/storage');
const repo = require('./documents.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const doc = await repo.findById(id);
    if (!doc) throw new AppError('Document not found.', 404);
    return doc;
}

// Caminho absoluto do ficheiro, confinado ao diretório de uploads.
// Defesa em profundidade contra path traversal caso file_path seja adulterado.
function resolveFilePath(doc) {
    const abs = path.resolve(doc.file_path);
    if (!abs.startsWith(uploadDir + path.sep) && abs !== uploadDir) {
        throw new AppError('Invalid file path.', 500);
    }
    return abs;
}

async function createDocument(file, body, adminId) {
    if (!file) throw new AppError('File is required.', 400);

    if (body.category_id) {
        const cat = await repo.findCategoryById(body.category_id);
        if (!cat) throw new AppError('Document category not found.', 400);
    }

    return repo.create({
        title: body.title,
        description: body.description,
        category_id: body.category_id,
        published_date: body.published_date,
        file_path: file.path,
        file_name: file.originalname,
        file_size: file.size,
        mime_type: file.mimetype,
        uploaded_by: adminId,
    });
}

async function updateDocument(id, body) {
    await getById(id);
    if (body.category_id) {
        const cat = await repo.findCategoryById(body.category_id);
        if (!cat) throw new AppError('Document category not found.', 400);
    }
    return repo.update(id, body);
}

async function deleteDocument(id) {
    const doc = await getById(id);
    await deleteFile(doc.file_path);
    await repo.remove(id);
}

// ---------- Categorias ----------

async function getCategories() { return repo.findAllCategories(); }

async function createCategory(name) { return repo.createCategory(name); }

async function updateCategory(id, name) {
    const cat = await repo.findCategoryById(id);
    if (!cat) throw new AppError('Document category not found.', 404);
    return repo.updateCategory(id, name);
}

async function deleteCategory(id) {
    const cat = await repo.findCategoryById(id);
    if (!cat) throw new AppError('Document category not found.', 404);
    // FK é ON DELETE SET NULL — documentos existentes ficam sem categoria.
    await repo.removeCategory(id);
}

module.exports = {
    getAll, getById, resolveFilePath, createDocument, updateDocument, deleteDocument,
    getCategories, createCategory, updateCategory, deleteCategory,
};
