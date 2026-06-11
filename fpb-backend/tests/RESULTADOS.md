# Resultados dos Testes Funcionais — FPB API

> Gerado automaticamente por `tests/run-tests.js` em 2026-06-11T21:15:36.606Z

**Resumo:** 19/19 testes passaram.

| ID | Teste | Pedido | Esperado | Obtido | Resultado |
|----|-------|--------|----------|--------|:---------:|
| AUTH-1 | Login com credenciais válidas | `POST /auth/login` | 200 + token | 200 token=true | ✅ |
| AUTH-2 | Login com password errada | `POST /auth/login` | 401 + envelope {error,message,code} | 401 env=true | ✅ |
| AUTH-3 | Login sem password (validação) | `POST /auth/login` | 400 | 400 | ✅ |
| AUTH-4 | Endpoint protegido sem token | `POST /clubs (sem token)` | 401 + envelope | 401 env=true | ✅ |
| STAND-1 | Classificação sem jogos → equipas a zeros | `GET /competitions/:id/standings` | 200 + 4 equipas a zeros | 200 n=4 zeros=true | ✅ |
| GAME-1 | Agendar jogo válido (estado inicial Agendado) | `POST /games` | 201 + estado 'Agendado' | 201 estado=Agendado | ✅ |
| RESULT-1 | Registar resultado (estado→Realizado + classificacao_atualizada) | `PUT /games/:id/result` | 200 + 'Realizado' + classificacao_atualizada:true | 200 estado=Realizado flag=true | ✅ |
| STAND-2 | Classificação reflete resultados (V/D/pontos corretos) | `GET /competitions/:id/standings` | t0:2V0D=4pts(1º); t3:1V=2pts; t2:2D=2pts; t1:1D=1pt | t0=2V0D 4pts pos1 | ✅ |
| STAND-3 | Reeditar resultado NÃO conta o jogo duas vezes | `PUT /games/:id/result (2ª vez)` | t0.played=2 (não 3), wins=2 | played=2 wins=2 | ✅ |
| VAL-1 | Jogo com equipa casa = equipa fora | `POST /games` | 400 | 400 | ✅ |
| VAL-2 | Jogo com competição inexistente (FK controlada) | `POST /games` | 400/404 (NÃO 500) | 400 | ✅ |
| VAL-3 | Resultado com pontos negativos | `PUT /games/:id/result` | 400 | 400 | ✅ |
| VAL-4 | Resultado com texto em vez de número | `PUT /games/:id/result` | 400 | 400 | ✅ |
| ROB-1 | GET de clube inexistente | `GET /clubs/99999999` | 404 + envelope | 404 env=true | ✅ |
| ROB-2 | Body JSON malformado (sem crash) | `POST /clubs (JSON inválido)` | 400 (servidor não crasha) | 400 | ✅ |
| ROB-3 | Rota inexistente devolve JSON | `GET /naoexiste` | 404 + envelope JSON | 404 env=true | ✅ |
| ROB-4 | Pesquisa com tentativa de SQL injection | `GET /search?q=' OR '1'='1` | 200 + resultados normais (sem erro SQL) | 200 dataArray=true | ✅ |
| ROB-5 | Apagar clube com equipas associadas | `DELETE /clubs/:id` | 204 + equipa fica com club_id NULL (sem 500) | 204 orphan=true | ✅ |
| CONF-1 | DELETE devolve 204 sem body | `DELETE /games/:id` | 204 + body vazio | 204 body=vazio | ✅ |
