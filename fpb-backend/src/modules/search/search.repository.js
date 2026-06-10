const { query } = require('../../infrastructure/database/connection');

async function globalSearch(q, type = 'all', page = 1, limit = 20) {
    const like = `%${q}%`;
    const offset = (parseInt(page) - 1) * parseInt(limit);
    const results = [];

    if (type === 'all' || type === 'clubs') {
        const clubs = await query(
            `SELECT 'club' AS type, id, name AS title, city AS subtitle FROM Club
             WHERE name LIKE ? OR short_name LIKE ? OR city LIKE ? LIMIT 10`,
            [like, like, like]
        );
        results.push(...clubs);
    }

    if (type === 'all' || type === 'members') {
        const members = await query(
            `SELECT 'member' AS type, p.id,
                CONCAT(p.first_name, ' ', p.last_name) AS title,
                p.nationality AS subtitle
             FROM Person p
             WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? LIMIT 10`,
            [like, like, like]
        );
        results.push(...members);
    }

    if (type === 'all' || type === 'competitions') {
        const competitions = await query(
            `SELECT 'competition' AS type, id, name AS title, season AS subtitle
             FROM Competition WHERE name LIKE ? LIMIT 10`,
            [like]
        );
        results.push(...competitions);
    }

    if (type === 'all' || type === 'games') {
        const games = await query(
            `SELECT 'game' AS type, g.id,
                CONCAT(ht.name, ' vs ', at.name) AS title,
                DATE_FORMAT(g.game_date, '%Y-%m-%d') AS subtitle
             FROM Game g
             JOIN Team ht ON ht.id = g.home_team_id
             JOIN Team at ON at.id = g.away_team_id
             WHERE ht.name LIKE ? OR at.name LIKE ? OR g.venue LIKE ? LIMIT 10`,
            [like, like, like]
        );
        results.push(...games);
    }

    const total = results.length;
    return {
        rows: results.slice(offset, offset + parseInt(limit)),
        total,
    };
}

module.exports = { globalSearch };
