const path = require('path');
const fs = require('fs');
const multer = require('multer');
const AppError = require('../../shared/utils/AppError');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const ALLOWED_MIME_TYPES = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'image/jpeg',
    'image/png',
    'image/gif',
    'text/plain',
]);

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${unique}${path.extname(file.originalname)}`);
    },
});

const upload = multer({
    storage,
    limits: { fileSize: 20 * 1024 * 1024 },
    fileFilter: (req, file, cb) => {
        if (ALLOWED_MIME_TYPES.has(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new AppError(`File type not allowed: ${file.mimetype}`, 400), false);
        }
    },
});

async function deleteFile(filePath) {
    const abs = path.resolve(filePath);
    try {
        await fs.promises.unlink(abs);
    } catch (err) {
        if (err.code !== 'ENOENT') throw err;
    }
}

module.exports = { upload, deleteFile, uploadDir };
