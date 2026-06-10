const AppError = require('../../shared/utils/AppError');

function errorHandler(err, req, res, next) {
    if (err instanceof AppError) {
        return res.status(err.statusCode).json({ success: false, error: err.message });
    }

    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json({ success: false, error: 'Duplicate entry — resource already exists.' });
    }

    console.error(err);
    res.status(500).json({ success: false, error: 'Internal server error.' });
}

module.exports = { errorHandler };
