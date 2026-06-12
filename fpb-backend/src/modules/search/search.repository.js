const { query } = require('../../infrastructure/database/connection');

// Pesquisa global (RF24–RF27): devolve até `limit` resultados POR TIPO de entidade.
// Sem paginação — o T5 só prevê paginação em listagens de volume elevado (jogos e
// membros); a pesquisa devolve os melhores N de cada tipo, organizados por tipo.
async function globalSearch(q, type = 'all', limit = 10) {
    const like = `%${q}%`;
    const lim = Math.min(parseInt(limit) || 10, 25);

    const wants = (t) => type === 'all' || type === t;

    const [clubs, members, competitions, games] = await Promise.all([
        wants('clubs')
            ? query(
                `SELECT 'club' AS type, id, name AS title, city AS subtitle
                 FROM Club WHERE name LIKE ? OR short_name LIKE ? OR city LIKE ? LIMIT ${lim}`,
                [like, like, like]
            )
            : Promise.resolve([]),
        wants('members')
            ? query(
                `SELECT 'member' AS type, p.id,
                    CONCAT(p.first_name, ' ', p.last_name) AS title,
                    p.nationality AS subtitle
                 FROM Person p
                 WHERE p.first_name LIKE ? OR p.last_name LIKE ? OR p.email LIKE ? LIMIT ${lim}`,
                [like, like, like]
            )
            : Promise.resolve([]),
        wants('competitions')
            ? query(
                `SELECT 'competition' AS type, id, name AS title, season AS subtitle
                 FROM Competition WHERE name LIKE ? LIMIT ${lim}`,
                [like]
            )
            : Promise.resolve([]),
        wants('games')
            ? query(
                `SELECT 'game' AS type, g.id,
                    CONCAT(ht.name, ' vs ', at.name) AS title,
                    DATE_FORMAT(g.game_date, '%Y-%m-%d') AS subtitle
                 FROM Game g
                 JOIN Team ht ON ht.id = g.home_team_id
                 JOIN Team at ON at.id = g.away_team_id
                 WHERE ht.name LIKE ? OR at.name LIKE ? OR g.venue LIKE ? LIMIT ${lim}`,
                [like, like, like]
            )
            : Promise.resolve([]),
    ]);

    return { clubs, members, competitions, games };
}

module.exports = { globalSearch };
