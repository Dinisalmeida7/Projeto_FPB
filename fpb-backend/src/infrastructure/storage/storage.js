const path = require('path');
const fs = require('fs');
const multer = require('multer');

const uploadDir = path.resolve(process.env.UPLOAD_DIR || 'uploads');

if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

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
