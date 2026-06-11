/**
 * Testes funcionais da API FPB (T6 — testes funcionais básicos).
 *
 * Faz setup das fixtures (clube + 4 equipas + competição + inscrições) diretamente
 * na base de dados, executa todos os cenários via HTTP contra a API a correr, e
 * no fim imprime uma tabela de resultados e escreve tests/RESULTADOS.md.
 *
 * Pré-requisitos:
 *   1. Base de dados criada (Schema.sql) com o super admin seeded.
 *   2. Servidor a correr noutro terminal:  npm run dev
 *   3. Node 18+ (usa fetch nativo).
 *
 * Correr:  npm run test:functional   (ou  node tests/run-tests.js)
 */

require('dotenv').config();
const fs = require('fs');
const path = require('path');
const { query, closePool } = require('../src/infrastructure/database/connection');

const PORT = process.env.PORT || 3000;
const BASE = `http://localhost:${PORT}/api/v1`;
const ADMIN = { email: 'admin@fpb.pt', password: 'Admin1234' };

const stamp = Date.now();
const M = `ZZTEST-${stamp}`; // marcador único para limpeza por nome
const fx = { clubId: null, teamIds: [], compId: null, delClubId: null, delTeamId: null };
const results = [];
let token = null;

// ---------- helpers HTTP ----------
async function api(method, p, opts = {}) {
    const { tok, body, rawBody, contentType } = opts;
    const headers = {};
    let payload;
    if (rawBody !== undefined) {
        headers['Content-Type'] = contentType || 'application/json';
        payload = rawBody;
    } else if (body !== undefined) {
        headers['Content-Type'] = 'application/json';
        payload = JSON.stringify(body);
    }
    if (tok) headers['Authorization'] = `Bearer ${tok}`;
    const res = await fetch(`${BASE}${p}`, { method, headers, body: payload });
    const text = await res.text();
    let parsed = null;
    if (text) { try { parsed = JSON.parse(text); } catch { parsed = text; } }
    return { status: res.status, body: parsed };
}

const isEnvelope = (b) => b && typeof b === 'object' && ['error', 'message', 'code'].every((k) => k in b);

// ---------- registo de resultados ----------
function record(id, descricao, pedido, esperado, got, pass) {
    results.push({ id, descricao, pedido, esperado, got, pass });
}

async function test(id, descricao, pedido, fn) {
    try {
        const { esperado, got, pass } = await fn();
        record(id, descricao, pedido, esperado, got, pass);
    } catch (e) {
        record(id, descricao, pedido, '(sem excepção)', `ERRO: ${e.message}`, false);
    }
}

async function createGame(homeIdx, awayIdx) {
    return api('POST', '/games', {
        tok: token,
        body: {
            competition_id: fx.compId,
            home_team_id: fx.teamIds[homeIdx],
            away_team_id: fx.teamIds[awayIdx],
            game_date: '2025-01-10T19:00:00',
            venue: 'Pavilhao Teste',
        },
    });
}

// ---------- setup / teardown (SQL direto) ----------
async function setup() {
    const club = await query('INSERT INTO Club (name, short_name, city, district) VALUES (?, ?, ?, ?)',
        [`${M}-CLUB`, 'TST', 'Lisboa', 'Lisboa']);
    fx.clubId = club.insertId;

    for (let i = 0; i < 4; i++) {
        const t = await query('INSERT INTO Team (name, club_id, gender, age_group) VALUES (?, ?, ?, ?)',
            [`${M}-TEAM-${i}`, fx.clubId, 'male', 'Seniores']);
        fx.teamIds.push(t.insertId);
    }

    const comp = await query(
        'INSERT INTO Competition (name, season, gender, age_group, level, status) VALUES (?, ?, ?, ?, ?, ?)',
        [`${M}-COMP`, '2024/2025', 'male', 'Seniores', 'national', 'ongoing']);
    fx.compId = comp.insertId;

    for (const tid of fx.teamIds) {
        await query('INSERT INTO CompetitionTeam (competition_id, team_id) VALUES (?, ?)', [fx.compId, tid]);
    }

    // clube + equipa descartáveis para o teste "apagar clube com equipas"
    const dc = await query('INSERT INTO Club (name, short_name, city) VALUES (?, ?, ?)', [`${M}-DELCLUB`, 'DEL', 'Porto']);
    fx.delClubId = dc.insertId;
    const dt = await query('INSERT INTO Team (name, club_id, gender, age_group) VALUES (?, ?, ?, ?)',
        [`${M}-DELTEAM`, fx.delClubId, 'male', 'Seniores']);
    fx.delTeamId = dt.insertId;
}

async function teardown() {
    // Competition tem ON DELETE CASCADE para Game e CompetitionTeam
    await query("DELETE FROM Competition WHERE name LIKE 'ZZTEST-%'");
    await query("DELETE FROM Team WHERE name LIKE 'ZZTEST-%'");
    await query("DELETE FROM Club WHERE name LIKE 'ZZTEST-%'");
}

// ---------- cenários ----------
async function runScenarios() {
    // --- 1. Autenticação ---
    await test('AUTH-1', 'Login com credenciais válidas', 'POST /auth/login', async () => {
        const r = await api('POST', '/auth/login', { body: ADMIN });
        token = r.body?.data?.token || token;
        return { esperado: '200 + token', got: `${r.status} token=${!!r.body?.data?.token}`, pass: r.status === 200 && !!r.body?.data?.token };
    });

    await test('AUTH-2', 'Login com password errada', 'POST /auth/login', async () => {
        const r = await api('POST', '/auth/login', { body: { email: ADMIN.email, password: 'errada' } });
        return { esperado: '401 + envelope {error,message,code}', got: `${r.status} env=${isEnvelope(r.body)}`, pass: r.status === 401 && isEnvelope(r.body) };
    });

    await test('AUTH-3', 'Login sem password (validação)', 'POST /auth/login', async () => {
        const r = await api('POST', '/auth/login', { body: { email: ADMIN.email } });
        return { esperado: '400', got: String(r.status), pass: r.status === 400 };
    });

    await test('AUTH-4', 'Endpoint protegido sem token', 'POST /clubs (sem token)', async () => {
        const r = await api('POST', '/clubs', { body: { name: 'X' } });
        return { esperado: '401 + envelope', got: `${r.status} env=${isEnvelope(r.body)}`, pass: r.status === 401 && isEnvelope(r.body) };
    });

    // --- 2. Classificação dinâmica ---
    await test('STAND-1', 'Classificação sem jogos → equipas a zeros', 'GET /competitions/:id/standings', async () => {
        const r = await api('GET', `/competitions/${fx.compId}/standings`);
        const rows = r.body?.data || [];
        const allZero = rows.length === 4 && rows.every((t) => t.played === 0 && t.wins === 0 && t.losses === 0 && t.points === 0);
        return { esperado: '200 + 4 equipas a zeros', got: `${r.status} n=${rows.length} zeros=${allZero}`, pass: r.status === 200 && allZero };
    });

    let gameA, gameB, gameC;
    await test('GAME-1', 'Agendar jogo válido (estado inicial Agendado)', 'POST /games', async () => {
        const r = await createGame(0, 1);
        gameA = r.body?.data?.id;
        return { esperado: "201 + estado 'Agendado'", got: `${r.status} estado=${r.body?.data?.status}`, pass: r.status === 201 && r.body?.data?.status === 'Agendado' };
    });
    // jogos adicionais (sem linha própria na tabela)
    gameB = (await createGame(2, 3)).body?.data?.id;
    gameC = (await createGame(0, 2)).body?.data?.id;

    await test('RESULT-1', 'Registar resultado (estado→Realizado + classificacao_atualizada)', 'PUT /games/:id/result', async () => {
        const r = await api('PUT', `/games/${gameA}/result`, { tok: token, body: { score_home: 80, score_away: 70 } });
        const d = r.body?.data || {};
        return {
            esperado: "200 + 'Realizado' + classificacao_atualizada:true",
            got: `${r.status} estado=${d.status} flag=${d.classificacao_atualizada}`,
            pass: r.status === 200 && d.status === 'Realizado' && d.classificacao_atualizada === true,
        };
    });
    // registar os restantes resultados
    await api('PUT', `/games/${gameB}/result`, { tok: token, body: { score_home: 90, score_away: 100 } });  // team3 vence
    await api('PUT', `/games/${gameC}/result`, { tok: token, body: { score_home: 75, score_away: 60 } });    // team0 vence

    await test('STAND-2', 'Classificação reflete resultados (V/D/pontos corretos)', 'GET /competitions/:id/standings', async () => {
        const r = await api('GET', `/competitions/${fx.compId}/standings`);
        const by = Object.fromEntries((r.body?.data || []).map((t) => [t.team_id, t]));
        const t0 = by[fx.teamIds[0]], t1 = by[fx.teamIds[1]], t2 = by[fx.teamIds[2]], t3 = by[fx.teamIds[3]];
        // Esperado (FPB: 2pts vitória, 1pt derrota):
        // t0: 2V 0D = 4pts pos1 | t3: 1V 0D = 2pts | t2: 0V 2D = 2pts | t1: 0V 1D = 1pt
        const ok = t0.wins === 2 && t0.losses === 0 && t0.points === 4 && t0.position === 1
            && t3.wins === 1 && t3.losses === 0 && t3.points === 2
            && t2.wins === 0 && t2.losses === 2 && t2.points === 2
            && t1.wins === 0 && t1.losses === 1 && t1.points === 1;
        return { esperado: 't0:2V0D=4pts(1º); t3:1V=2pts; t2:2D=2pts; t1:1D=1pt', got: `t0=${t0.wins}V${t0.losses}D ${t0.points}pts pos${t0.position}`, pass: r.status === 200 && ok };
    });

    await test('STAND-3', 'Reeditar resultado NÃO conta o jogo duas vezes', 'PUT /games/:id/result (2ª vez)', async () => {
        await api('PUT', `/games/${gameC}/result`, { tok: token, body: { score_home: 100, score_away: 50 } }); // continua vitória t0
        const r = await api('GET', `/competitions/${fx.compId}/standings`);
        const t0 = (r.body?.data || []).find((t) => t.team_id === fx.teamIds[0]);
        return { esperado: 't0.played=2 (não 3), wins=2', got: `played=${t0?.played} wins=${t0?.wins}`, pass: !!t0 && t0.played === 2 && t0.wins === 2 };
    });

    // --- 3. Validações de domínio ---
    await test('VAL-1', 'Jogo com equipa casa = equipa fora', 'POST /games', async () => {
        const r = await api('POST', '/games', { tok: token, body: { competition_id: fx.compId, home_team_id: fx.teamIds[0], away_team_id: fx.teamIds[0] } });
        return { esperado: '400', got: String(r.status), pass: r.status === 400 };
    });

    await test('VAL-2', 'Jogo com competição inexistente (FK controlada)', 'POST /games', async () => {
        const r = await api('POST', '/games', { tok: token, body: { competition_id: 99999999, home_team_id: fx.teamIds[0], away_team_id: fx.teamIds[1] } });
        return { esperado: '400/404 (NÃO 500)', got: String(r.status), pass: r.status === 400 || r.status === 404 };
    });

    await test('VAL-3', 'Resultado com pontos negativos', 'PUT /games/:id/result', async () => {
        const r = await api('PUT', `/games/${gameA}/result`, { tok: token, body: { score_home: -5, score_away: 10 } });
        return { esperado: '400', got: String(r.status), pass: r.status === 400 };
    });

    await test('VAL-4', 'Resultado com texto em vez de número', 'PUT /games/:id/result', async () => {
        const r = await api('PUT', `/games/${gameA}/result`, { tok: token, body: { score_home: 'abc', score_away: 10 } });
        return { esperado: '400', got: String(r.status), pass: r.status === 400 };
    });

    // --- 4. Robustez geral ---
    await test('ROB-1', 'GET de clube inexistente', 'GET /clubs/99999999', async () => {
        const r = await api('GET', '/clubs/99999999');
        return { esperado: '404 + envelope', got: `${r.status} env=${isEnvelope(r.body)}`, pass: r.status === 404 && isEnvelope(r.body) };
    });

    await test('ROB-2', 'Body JSON malformado (sem crash)', 'POST /clubs (JSON inválido)', async () => {
        const r = await api('POST', '/clubs', { tok: token, rawBody: '{ "name": "X", }' });
        return { esperado: '400 (servidor não crasha)', got: String(r.status), pass: r.status === 400 };
    });

    await test('ROB-3', 'Rota inexistente devolve JSON', 'GET /naoexiste', async () => {
        const r = await api('GET', '/naoexiste');
        return { esperado: '404 + envelope JSON', got: `${r.status} env=${isEnvelope(r.body)}`, pass: r.status === 404 && isEnvelope(r.body) };
    });

    await test('ROB-4', 'Pesquisa com tentativa de SQL injection', "GET /search?q=' OR '1'='1", async () => {
        const r = await api('GET', `/search?q=${encodeURIComponent("' OR '1'='1")}`);
        return { esperado: '200 + resultados normais (sem erro SQL)', got: `${r.status} dataArray=${Array.isArray(r.body?.data)}`, pass: r.status === 200 && Array.isArray(r.body?.data) };
    });

    await test('ROB-5', 'Apagar clube com equipas associadas', 'DELETE /clubs/:id', async () => {
        const r = await api('DELETE', `/clubs/${fx.delClubId}`, { tok: token });
        const row = await query('SELECT club_id FROM Team WHERE id = ?', [fx.delTeamId]);
        const orphaned = row.length === 1 && row[0].club_id === null;
        return { esperado: '204 + equipa fica com club_id NULL (sem 500)', got: `${r.status} orphan=${orphaned}`, pass: r.status === 204 && orphaned };
    });

    // --- 5. Conformidade T5 ---
    await test('CONF-1', 'DELETE devolve 204 sem body', 'DELETE /games/:id', async () => {
        const g = await createGame(1, 3);
        const r = await api('DELETE', `/games/${g.body?.data?.id}`, { tok: token });
        const empty = r.body === null || r.body === undefined || r.body === '';
        return { esperado: '204 + body vazio', got: `${r.status} body=${empty ? 'vazio' : 'presente'}`, pass: r.status === 204 && empty };
    });
}

// ---------- saída ----------
function output() {
    const total = results.length;
    const passed = results.filter((r) => r.pass).length;

    console.log('\n══════════════════════════════════════════════════════════════');
    console.log(`  RESULTADOS DOS TESTES FUNCIONAIS — ${passed}/${total} passaram`);
    console.log('══════════════════════════════════════════════════════════════\n');
    console.table(results.map((r) => ({ ID: r.id, Teste: r.descricao, Esperado: r.esperado, Obtido: r.got, OK: r.pass ? '✓' : '✗' })));

    const md = [
        '# Resultados dos Testes Funcionais — FPB API',
        '',
        `> Gerado automaticamente por \`tests/run-tests.js\` em ${new Date().toISOString()}`,
        '',
        `**Resumo:** ${passed}/${total} testes passaram.`,
        '',
        '| ID | Teste | Pedido | Esperado | Obtido | Resultado |',
        '|----|-------|--------|----------|--------|:---------:|',
        ...results.map((r) => `| ${r.id} | ${r.descricao} | \`${r.pedido}\` | ${r.esperado} | ${r.got} | ${r.pass ? '✅' : '❌'} |`),
        '',
    ].join('\n');
    fs.writeFileSync(path.join(__dirname, 'RESULTADOS.md'), md, 'utf8');
    console.log(`\nTabela escrita em tests/RESULTADOS.md`);
    return passed === total;
}

// ---------- main ----------
(async () => {
    if (typeof fetch === 'undefined') {
        console.error('Este runner precisa de Node 18+ (fetch nativo).');
        process.exit(1);
    }
    // servidor a responder?
    try {
        await fetch(`http://localhost:${PORT}/health`);
    } catch {
        console.error(`\n❌ O servidor não responde em http://localhost:${PORT}.`);
        console.error("   Arranca-o noutro terminal com 'npm run dev' e volta a correr os testes.\n");
        await closePool();
        process.exit(1);
    }

    let allPassed = false;
    try {
        await teardown(); // limpar restos de execuções anteriores
        await setup();
        await runScenarios();
        allPassed = output();
    } catch (e) {
        console.error('Erro inesperado a correr os testes:', e);
    } finally {
        await teardown();
        await closePool();
    }
    process.exit(allPassed ? 0 : 1);
})();
