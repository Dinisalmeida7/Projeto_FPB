const AppError = require('../../shared/utils/AppError');

const STATUS_LABELS = {
    400: 'Bad Request',
    401: 'Unauthorized',
    403: 'Forbidden',
    404: 'Not Found',
    409: 'Conflict',
    413: 'Payload Too Large',
    422: 'Unprocessable Entity',
    429: 'Too Many Requests',
    500: 'Internal Server Error',
};

// Envelope de erro uniforme em toda a API: { error, message, code }
function buildError(code, message) {
    return { error: STATUS_LABELS[code] || 'Error', message, code };
}

function errorHandler(err, req, res, next) {
    // Erros de aplicação previstos
    if (err instanceof AppError) {
        return res.status(err.statusCode).json(buildError(err.statusCode, err.message));
    }

    // Body JSON malformado (express.json lança SyntaxError com .type)
    if (err.type === 'entity.parse.failed' || (err instanceof SyntaxError && 'body' in err)) {
        return res.status(400).json(buildError(400, 'Malformed JSON in request body.'));
    }

    // Body acima do limite configurado
    if (err.type === 'entity.too.large') {
        return res.status(413).json(buildError(413, 'Request body too large.'));
    }

    // Upload acima do limite (multer)
    if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(413).json(buildError(413, 'Uploaded file is too large.'));
    }

    // MySQL: valor único duplicado
    if (err.code === 'ER_DUP_ENTRY') {
        return res.status(409).json(buildError(409, 'Resource already exists (duplicate value).'));
    }

    // MySQL: referência inexistente numa FK (insert/update) — ex.: competição/equipa que não existe
    if (err.code === 'ER_NO_REFERENCED_ROW' || err.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json(buildError(400, 'Referenced resource does not exist.'));
    }

    // MySQL: linha ainda referenciada por outras (delete) — ex.: apagar algo em uso
    if (err.code === 'ER_ROW_IS_REFERENCED' || err.code === 'ER_ROW_IS_REFERENCED_2') {
        return res.status(409).json(buildError(409, 'Cannot delete: resource is referenced by other records.'));
    }

    // MySQL: violação de CHECK (ex.: home_team_id <> away_team_id ao nível da BD)
    if (err.code === 'ER_CHECK_CONSTRAINT_VIOLATED') {
        return res.status(400).json(buildError(400, 'Request violates a data constraint.'));
    }

    console.error(err);
    return res.status(500).json(buildError(500, 'Internal server error.'));
}

// Catch-all para rotas inexistentes — responde em JSON, não no HTML por defeito do Express
function notFoundHandler(req, res) {
    return res.status(404).json(buildError(404, `Route not found: ${req.method} ${req.originalUrl}`));
}

module.exports = { errorHandler, notFoundHandler, buildError };
