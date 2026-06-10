function success(res, data, statusCode = 200, meta = null) {
    const body = { success: true, data };
    if (meta) body.meta = meta;
    return res.status(statusCode).json(body);
}

function error(res, message, statusCode = 500, code = null) {
    const body = { success: false, error: message };
    if (code) body.code = code;
    return res.status(statusCode).json(body);
}

function paginate(res, data, total, page, limit) {
    return success(res, data, 200, {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
    });
}

module.exports = { success, error, paginate };
