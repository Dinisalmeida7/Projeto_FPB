const asyncHandler = require('../../shared/utils/asyncHandler');
const { paginate } = require('../../shared/utils/responseFormatter');
const { globalSearch } = require('./search.repository');

const search = asyncHandler(async (req, res) => {
    const { q, type = 'all', page = 1, limit = 20 } = req.query;
    const { rows, total } = await globalSearch(q.trim(), type, page, limit);
    return paginate(res, rows, total, page, limit);
});

module.exports = { search };
