const asyncHandler = require('../../shared/utils/asyncHandler');
const { success } = require('../../shared/utils/responseFormatter');
const { globalSearch } = require('./search.repository');

const search = asyncHandler(async (req, res) => {
    const { q, type = 'all', limit = 10 } = req.query;
    const groups = await globalSearch(q.trim(), type, limit);

    // Lista plana (compatível com consumo simples) + contagens por tipo (RF26)
    const rows = [...groups.clubs, ...groups.members, ...groups.competitions, ...groups.games];
    const counts = {
        clubs: groups.clubs.length,
        members: groups.members.length,
        competitions: groups.competitions.length,
        games: groups.games.length,
    };

    return success(res, rows, 200, { total: rows.length, counts });
});

module.exports = { search };
