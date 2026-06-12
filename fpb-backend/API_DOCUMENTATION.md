# API FPB — Documentação dos Endpoints

REST API da plataforma de gestão de informação desportiva (Federação Portuguesa de Basquetebol).

## Convenções (T5.1)

| Convenção | Detalhe |
|---|---|
| Base URL | `http://localhost:3000/api/v1` |
| Formato | JSON em todos os pedidos e respostas (exceção: upload de documentos em `multipart/form-data`) |
| Autenticação | JWT no header `Authorization: Bearer <token>` — obrigatório nos endpoints marcados 🔒 |
| Paginação | `?page=` e `?limit=` (máx. 100) nas listagens |
| Datas | ISO 8601 — `YYYY-MM-DD` / `YYYY-MM-DDTHH:MM:SS` |
| Sucesso | `{ "success": true, "data": ..., "meta": { ... } }` |
| Erro | `{ "error": "Not Found", "message": "...", "code": 404 }` |

**Códigos de estado:** `200` OK · `201` Created · `204` No Content (DELETE) · `400` Bad Request · `401` Unauthorized · `403` Forbidden · `404` Not Found · `409` Conflict · `413` Payload Too Large · `429` Too Many Requests · `500` Internal Server Error

**Permissões:** os endpoints 🔒 exigem token válido. Operações de escrita exigem ainda permissão na área respetiva (`clubs`, `competitions`, `games`, `members`, `documents`, `administrators`) com a flag adequada (`can_create`, `can_edit`, `can_delete`), verificada na base de dados a cada pedido. O super-admin tem acesso total.

---

## Autenticação

| Método | Endpoint | Descrição |
|---|---|---|
| POST | `/auth/login` | Login do administrador (rate-limited) |
| POST | `/auth/logout` 🔒 | Logout (regista no log de auditoria) |

```json
POST /auth/login
{ "email": "admin@fpb.pt", "password": "..." }

→ 200 { "success": true, "data": { "token": "...", "admin": { "id": 1, "name": "...", "email": "...", "is_superadmin": 1 } } }
```

## Associações

> A gestão de associações e equipas usa a área de permissões `clubs` (T4 agrupa Clubes, Equipas e Associações no mesmo grupo funcional).

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/associations` | Listar associações (`?search=`, paginado) |
| GET | `/associations/:id` | Ficha da associação (inclui `clubs` filiados e `teams`/seleções) |
| POST | `/associations` 🔒 | Criar associação (`{ "name": "..." }`) |
| PUT | `/associations/:id` 🔒 | Editar associação |
| DELETE | `/associations/:id` 🔒 | Remover (clubes/equipas/juízes ficam sem associação — não são apagados) |

## Clubes

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/clubs` | Listar clubes (`?search=`, `?district=`, `?is_active=`, paginado) |
| GET | `/clubs/:id` | Ficha do clube (inclui `association_name` e `teams`) |
| POST | `/clubs` 🔒 | Criar clube |
| PUT | `/clubs/:id` 🔒 | Editar clube |
| DELETE | `/clubs/:id` 🔒 | Remover clube |

Campos: `name`*, `short_name`, `acronym`, `city`, `district`, `association_id`, `founded_year`, `logo_url`, `website`, `email`, `phone`, `address`, `is_active`.

## Equipas

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/teams` | Listar (`?search=`, `?club_id=`, `?association_id=`, `?gender=`, `?age_group=`, paginado) |
| GET | `/teams/:id` | Ficha da equipa (inclui clube/associação, `coaches` e `athletes` por época) |
| POST | `/teams` 🔒 | Criar equipa — exige `club_id` **ou** `association_id` (seleções distritais) |
| PUT | `/teams/:id` 🔒 | Editar equipa (a regra clube-ou-associação mantém-se) |
| DELETE | `/teams/:id` 🔒 | Remover equipa (409 se tiver jogos associados) |
| POST | `/teams/:id/coaches` 🔒 | Associar treinador (`{ "coach_id": N }`) |
| DELETE | `/teams/:id/coaches/:coachId` 🔒 | Desassociar treinador |
| POST | `/teams/:id/athletes` 🔒 | Inscrever atleta no plantel (`{ "athlete_id": N, "season": "2024/2025", "jersey_number": N }`) |
| DELETE | `/teams/:id/athletes/:athleteId` 🔒 | Remover atleta do plantel (`?season=` opcional; sem season remove todas as épocas) |

Campos: `name`*, `club_id`, `association_id`, `gender` (`male|female|mixed`), `age_group`, `is_active`.

## Competições

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/competitions` | Listar (`?search=`, `?season=`, `?status=`, paginado) |
| GET | `/competitions/:id` | Detalhe da competição |
| GET | `/competitions/:id/standings` | Classificação (calculada dinamicamente; 2 pts vitória, 1 derrota) |
| POST | `/competitions` 🔒 | Criar competição |
| PUT | `/competitions/:id` 🔒 | Editar competição |
| DELETE | `/competitions/:id` 🔒 | Remover competição |
| POST | `/competitions/:id/teams` 🔒 | Inscrever equipa (`{ "team_id": N }`) |
| DELETE | `/competitions/:id/teams/:teamId` 🔒 | Remover equipa da competição |

Campos: `name`*, `season`* (`YYYY/YYYY`), `gender`, `age_group`, `level`, `status` (`scheduled|ongoing|finished|cancelled`), `start_date`, `end_date`, `description`.

## Jogos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/games` | Listar (`?competition_id=`, `?team_id=`, `?status=`, `?date_from=`, `?date_to=`, paginado) |
| GET | `/games/:id` | Detalhe (inclui `referees` e `athletes` com estatísticas) |
| POST | `/games` 🔒 | Agendar jogo |
| PUT | `/games/:id` 🔒 | Editar jogo |
| PUT | `/games/:id/result` 🔒 | Registar resultado (`{ "score_home": N, "score_away": N }`) → estado `Realizado` |
| DELETE | `/games/:id` 🔒 | Remover jogo |
| POST | `/games/:id/referees` 🔒 | Nomear juiz (`{ "referee_id": N, "role": "main|assistant|table" }`) |
| DELETE | `/games/:id/referees/:refereeId` 🔒 | Remover nomeação de juiz |
| POST | `/games/:id/athletes` 🔒 | Registar participação de atleta (`{ "athlete_id": N, "points": N, "rebounds": N, "assists": N, "minutes_played": N }`) |
| PUT | `/games/:id/athletes/:athleteId` 🔒 | Editar estatísticas do atleta no jogo |
| DELETE | `/games/:id/athletes/:athleteId` 🔒 | Remover atleta do jogo |

Estados do jogo: `Agendado`, `Em curso`, `Realizado`, `Adiado`, `Cancelado`.

## Membros

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/members` | Listar (`?search=`, `?role=athlete\|referee\|coach\|fpbmember`, paginado) |
| GET | `/members/:id` | Perfil completo (dados pessoais + secção por cada role) |
| POST | `/members` 🔒 | Criar pessoa (aceita `roles: { athlete: {...}, ... }` embutido) |
| PUT | `/members/:id` 🔒 | Editar pessoa (e roles embutidos; `roles.X: null` remove o role) |
| DELETE | `/members/:id` 🔒 | Remover pessoa |
| POST | `/members/:id/roles/:role` 🔒 | Atribuir role (409 se já existir) |
| PUT | `/members/:id/roles/:role` 🔒 | Editar dados de um role (404 se não existir) |
| DELETE | `/members/:id/roles/:role` 🔒 | Remover role |

Campos por role:
- **athlete**: `license_number`, `position` (`PG|SG|SF|PF|C`), `jersey_number`, `height_cm`, `weight_kg`, `is_active`
- **referee**: `license_number`, `level` (`national|regional|local`), `type` (`Árbitro|Oficial de Mesa`), `association_id`, `is_active`
- **coach**: `license_number`, `level`, `is_active`
- **fpbmember**: `member_number`, `role_description`, `is_active`

## Documentos

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/documents` | Listar (`?category_id=`, paginado) |
| GET | `/documents/:id` | Metadados do documento |
| GET | `/documents/:id/download` | Descarregar ficheiro |
| POST | `/documents` 🔒 | Carregar documento (`multipart/form-data`: `file` + `title`*, `description`, `category_id`, `published_date`) |
| PUT | `/documents/:id` 🔒 | Editar metadados (o ficheiro não é substituído) |
| DELETE | `/documents/:id` 🔒 | Remover documento (apaga também o ficheiro) |
| GET | `/documents/categories` | Listar categorias |
| POST | `/documents/categories` 🔒 | Criar categoria (`{ "name": "Regulamento" }`) |
| PUT | `/documents/categories/:id` 🔒 | Editar categoria |
| DELETE | `/documents/categories/:id` 🔒 | Remover categoria (documentos ficam sem categoria) |

Tipos aceites: PDF, Word, Excel, imagens (JPG/PNG/GIF) e TXT — máx. `MAX_FILE_SIZE_MB`.

## Pesquisa

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/search?q=palavra` | Pesquisa global (`?type=all\|clubs\|members\|competitions\|games`, `?limit=` por tipo, máx. 25) |

Resposta: lista plana com `type` em cada resultado + `meta.counts` por tipo de entidade.

## Administração

| Método | Endpoint | Descrição |
|---|---|---|
| GET | `/administrators` 🔒 | Listar administradores (acesso: área `administrators`) |
| GET | `/administrators/:id` 🔒 | Consultar administrador (próprio ou área `administrators`) |
| POST | `/administrators` 🔒 | Criar administrador (só super-admin pode criar super-admins) |
| PUT | `/administrators/:id` 🔒 | Editar (próprio ou área; `is_superadmin`/`is_active` só por super-admin) |
| DELETE | `/administrators/:id` 🔒 | **Desativar** administrador (soft delete; não pode desativar a própria conta) |
| GET | `/administrators/:id/permissions` 🔒 | Consultar permissões |
| PUT | `/administrators/:id/permissions` 🔒 | Atualizar permissões (não pode alterar as próprias) |
| GET | `/logs` 🔒 | Log de auditoria (`?admin_id=`, `?action=`, `?entity=`, paginado) |

Password: mínimo 8 caracteres com maiúscula, minúscula, dígito e carácter especial.

---

## Outros

- `GET /health` — health check (fora do prefixo `/api/v1`)
- Rate limiting: login (10 tentativas/15 min) + global (1000 pedidos/15 min, configurável)
- Em produção a API deve estar atrás de um reverse proxy com TLS (HTTPS) e `TRUST_PROXY=1`
