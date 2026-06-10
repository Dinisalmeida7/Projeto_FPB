const asyncHandler = require('../../shared/utils/asyncHandler');
const { paginate } = require('../../shared/utils/responseFormatter');
const AppError = require('../../shared/utils/AppError');
const { globalSearch } = require('./search.repository');

const search = asyncHandler(async (req, res) => {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    if (!q || q.trim().length < 2) throw new AppError('Query must be at least 2 characters.', 400);

    const { rows, total } = await globalSearch(q.trim(), type, page, limit);
    return paginate(res, rows, total, page, limit);
});

module.exports = { search };
