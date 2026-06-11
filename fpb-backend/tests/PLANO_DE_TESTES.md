# Plano de Testes Funcionais — FPB API (T6)

Testes funcionais básicos da API, organizados por categoria. Cobrem o cálculo
dinâmico de classificações, validações de domínio, robustez geral e conformidade
com a especificação T5.

## Como executar

**Automático** (recomendado) — corre todos os cenários e gera a tabela de resultados:

```bash
# Terminal 1 — base de dados criada + servidor a correr
npm run dev

# Terminal 2
npm run test:functional
```

O runner cria as suas próprias fixtures (1 clube + 4 equipas + 1 competição),
executa os testes, limpa tudo no fim e escreve os resultados em
[`RESULTADOS.md`](./RESULTADOS.md).

**Manual** (Thunder Client / Postman) — primeiro semear dados de demonstração:

```bash
mysql -u root -p fpb_db < src/infrastructure/database/Seed.sql
```

Credenciais do administrador: `admin@fpb.pt` / `Admin1234`.
Token obtido em `POST /api/v1/auth/login` → usar em `Authorization: Bearer <token>`.

---

## 1. Classificação dinâmica

| ID | Teste | Pedido | Resultado esperado |
|----|-------|--------|--------------------|
| STAND-1 | Competição sem jogos | `GET /competitions/:id/standings` | 200; as 4 equipas aparecem a zeros (não erro) |
| GAME-1 | Agendar jogo | `POST /games` | 201; estado inicial `Agendado` |
| RESULT-1 | Registar resultado | `PUT /games/:id/result` `{score_home, score_away}` | 200; estado passa a `Realizado`; resposta inclui `classificacao_atualizada: true` |
| STAND-2 | Classificação após resultados | `GET /competitions/:id/standings` | 200; vitórias, derrotas e pontos batem certo com o cálculo à mão (2 pts/vitória, 1 pt/derrota) |
| STAND-3 | Reeditar um resultado já registado | `PUT /games/:id/result` (2ª vez) | A classificação reflete o novo resultado **sem contar o jogo duas vezes** (jogos disputados mantém-se) |

> **Argumento para a apresentação:** como a classificação é calculada dinamicamente
> a partir dos jogos (não há tabela de resultados acumulados), reeditar um resultado
> é impossível de duplicar por construção — STAND-3 confirma-o.

### Cálculo manual de referência (STAND-2)

Jogos (equipas E0–E3): `E0 80–70 E1` · `E2 90–100 E3` · `E0 75–60 E2`

| Equipa | V | D | Pontos | Posição |
|--------|---|---|--------|---------|
| E0 | 2 | 0 | 4 | 1º |
| E3 | 1 | 0 | 2 | 2º (dif. +10) |
| E2 | 0 | 2 | 2 | 3º (dif. −25) |
| E1 | 0 | 1 | 1 | 4º |

---

## 2. Validações de domínio

| ID | Teste | Pedido | Resultado esperado |
|----|-------|--------|--------------------|
| VAL-1 | Equipa casa = equipa fora | `POST /games` (home = away) | 400 |
| VAL-2 | Competição/equipa inexistente | `POST /games` (`competition_id` inválido) | 400/404 controlado — **nunca 500** com erro de FK do MySQL a vazar |
| VAL-3 | Pontos negativos | `PUT /games/:id/result` (`score_home: -5`) | 400 |
| VAL-4 | Pontos não numéricos | `PUT /games/:id/result` (`score_home: "abc"`) | 400 |

---

## 3. Robustez geral

| ID | Teste | Pedido | Resultado esperado |
|----|-------|--------|--------------------|
| ROB-1 | Recurso inexistente | `GET /clubs/99999999` | 404 limpo + envelope |
| ROB-2 | JSON malformado | `POST /clubs` (body com vírgula a mais) | 400; o servidor **não crasha** |
| ROB-3 | Rota inexistente | `GET /naoexiste` | 404 em JSON (não HTML) |
| ROB-4 | Tentativa de SQL injection | `GET /search?q=' OR '1'='1` | 200; resultados normais, sem erro SQL (queries parametrizadas) |
| ROB-5 | Apagar clube com equipas | `DELETE /clubs/:id` | 204; as equipas ficam com `club_id = NULL` (`ON DELETE SET NULL`) — comportamento controlado, não 500 |

---

## 4. Conformidade com a T5

| ID | Teste | Pedido | Resultado esperado |
|----|-------|--------|--------------------|
| AUTH-1 | Login válido | `POST /auth/login` | 200 + token |
| AUTH-2 | Login inválido | `POST /auth/login` (password errada) | 401 + envelope `{ error, message, code }` |
| AUTH-3 | Validação no login | `POST /auth/login` (sem password) | 400 |
| AUTH-4 | Acesso sem token | `POST /clubs` (sem `Authorization`) | 401 + envelope |
| CONF-1 | DELETE bem-sucedido | `DELETE /games/:id` | 204 **sem body** |
| RESULT-1 | Estado e flag pós-resultado | `PUT /games/:id/result` | estado `Realizado` + `classificacao_atualizada: true` |
| — | Envelope de erro consistente | (todos os erros) | `{ "error": "...", "message": "...", "code": ... }` em todos os casos |

> **Nota sobre nomenclatura:** a API implementada usa nomes internos em inglês
> (`/clubs`, `/games`, `score_home`...). Os comportamentos visíveis exigidos pela T5
> — envelope de erro, estados `Agendado`/`Realizado`, DELETE 204, endpoint dedicado
> de resultado e `classificacao_atualizada` — estão conformes.

---

## Teste manual adicional (fora do runner)

**Rate limiting no login** — não incluído no runner automático para não esgotar o
limite. Manualmente: fazer >10 tentativas de login falhadas em 15 min → a partir da
11ª deve devolver **429** com o envelope de erro.
