# FPB Backend

REST API para a plataforma de gestão da Federação Portuguesa de Basquetebol.

**Stack:** Node.js · Express 5 · MySQL 8 · JWT

---

## Pré-requisitos

- Node.js 18+
- MySQL 8.0+

## Instalação

```bash
npm install
```

Copiar e preencher o ficheiro de ambiente:

```bash
cp ../.env.example ../.env
```

Criar a base de dados:

```sql
mysql -u root -p < src/infrastructure/database/Schema.sql
```

## Arranque

```bash
# Desenvolvimento (nodemon)
npm run dev

# Produção
npm start
```

A API fica disponível em `http://localhost:3000/api/v1`.

Health check: `GET /health`

---

## Variáveis de Ambiente

| Variável | Descrição | Padrão |
|---|---|---|
| `PORT` | Porta do servidor | `3000` |
| `DB_HOST` | Host da base de dados | `localhost` |
| `DB_PORT` | Porta da base de dados | `3306` |
| `DB_USER` | Utilizador MySQL | `root` |
| `DB_PASSWORD` | Password MySQL | _(vazio)_ |
| `DB_NAME` | Nome da base de dados | `fpb_db` |
| `DB_POOL_SIZE` | Número máximo de conexões no pool | `10` |
| `DB_QUEUE_LIMIT` | Limite da fila de espera do pool (0 = ilimitado) | `0` |
| `JWT_SECRET` | Chave secreta para assinar tokens | _(obrigatório)_ |
| `JWT_EXPIRES_IN` | Validade do token JWT | `24h` |
| `UPLOAD_DIR` | Directório de upload de ficheiros | `uploads/` |
| `MAX_FILE_SIZE_MB` | Tamanho máximo de upload em MB | `20` |
| `ALLOWED_ORIGIN` | Origem permitida pelo CORS | `http://localhost:5173` |
| `REQUEST_BODY_LIMIT` | Tamanho máximo do body HTTP | `1mb` |
| `RATE_LIMIT_WINDOW_MIN` | Janela do rate limit em minutos (login) | `15` |
| `RATE_LIMIT_MAX` | Tentativas máximas de login por janela | `10` |

---

## Estrutura

```
src/
├── app.js                         # Express app (middlewares + rotas)
├── server.js                      # Entry point (arranque + graceful shutdown)
├── api/
│   ├── middleware/
│   │   ├── auth.js                # Verificação de JWT
│   │   ├── permission.js          # requirePermission(area, action)
│   │   ├── errorHandler.js        # Handler de erros global
│   │   ├── rateLimiter.js         # Rate limit no login
│   │   └── validate.js            # express-validator error handler
│   └── routes/
│       └── index.js               # Agrega todos os módulos em /api/v1
├── infrastructure/
│   ├── database/
│   │   ├── connection.js          # Pool MySQL2 + withTransaction
│   │   └── Schema.sql             # Definição de tabelas e seed
│   └── storage/
│       └── storage.js             # Multer + deleteFile
├── modules/
│   ├── auth/                      # Login / Logout
│   ├── clubs/                     # Clubes
│   ├── competitions/              # Competições + classificações
│   ├── games/                     # Jogos + resultados
│   ├── members/                   # Pessoas (atletas, árbitros, treinadores, dirigentes)
│   ├── documents/                 # Upload e download de documentos
│   ├── administrators/            # Gestão de administradores e permissões
│   └── search/                    # Pesquisa global
└── shared/
    ├── utils/
    │   ├── AppError.js
    │   ├── asyncHandler.js
    │   ├── responseFormatter.js
    │   └── auditLogger.js
    └── validators/                # Regras express-validator por módulo
```

---

## Endpoints

### Auth
| Método | Rota | Acesso |
|---|---|---|
| `POST` | `/api/v1/auth/login` | Público |
| `POST` | `/api/v1/auth/logout` | Autenticado |

### Clubes
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/clubs` | Público |
| `GET` | `/api/v1/clubs/:id` | Público |
| `POST` | `/api/v1/clubs` | Admin (clubs.create) |
| `PUT` | `/api/v1/clubs/:id` | Admin (clubs.edit) |
| `DELETE` | `/api/v1/clubs/:id` | Admin (clubs.delete) |

### Membros
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/members` | Público |
| `GET` | `/api/v1/members/:id` | Público |
| `POST` | `/api/v1/members` | Admin (members.create) |
| `PUT` | `/api/v1/members/:id` | Admin (members.edit) |
| `DELETE` | `/api/v1/members/:id` | Admin (members.delete) |

### Competições
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/competitions` | Público |
| `GET` | `/api/v1/competitions/:id` | Público |
| `GET` | `/api/v1/competitions/:id/standings` | Público |
| `POST` | `/api/v1/competitions` | Admin (competitions.create) |
| `PUT` | `/api/v1/competitions/:id` | Admin (competitions.edit) |
| `DELETE` | `/api/v1/competitions/:id` | Admin (competitions.delete) |
| `POST` | `/api/v1/competitions/:id/teams` | Admin (competitions.edit) |
| `DELETE` | `/api/v1/competitions/:id/teams/:teamId` | Admin (competitions.delete) |

### Jogos
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/games` | Público |
| `GET` | `/api/v1/games/:id` | Público |
| `POST` | `/api/v1/games` | Admin (games.create) |
| `PUT` | `/api/v1/games/:id` | Admin (games.edit) |
| `DELETE` | `/api/v1/games/:id` | Admin (games.delete) |

### Documentos
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/documents` | Público |
| `GET` | `/api/v1/documents/:id/download` | Público |
| `POST` | `/api/v1/documents` | Admin (documents.create) |
| `DELETE` | `/api/v1/documents/:id` | Admin (documents.delete) |

### Administradores
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/administrators` | Super-admin |
| `GET` | `/api/v1/administrators/:id` | Autenticado |
| `POST` | `/api/v1/administrators` | Super-admin |
| `PUT` | `/api/v1/administrators/:id` | Super-admin ou próprio |
| `DELETE` | `/api/v1/administrators/:id` | Super-admin |
| `PUT` | `/api/v1/administrators/:id/permissions` | Super-admin |

### Pesquisa
| Método | Rota | Acesso |
|---|---|---|
| `GET` | `/api/v1/search?q=...` | Público |

**Query params search:** `q` (obrigatório, mín 2 chars) · `type` (all/clubs/members/competitions/games) · `page` · `limit`

---

## Formato de Resposta

**Sucesso:**
```json
{ "success": true, "data": { ... } }
```

**Lista paginada:**
```json
{
  "success": true,
  "data": [...],
  "meta": { "total": 100, "page": 1, "limit": 20, "totalPages": 5 }
}
```

**Erro:**
```json
{ "success": false, "error": "Mensagem de erro." }
```

---

## Autenticação

Todos os endpoints admin requerem o header:

```
Authorization: Bearer <token>
```

O token é obtido no `POST /api/v1/auth/login`.

### Permissões

Cada administrador tem permissões granulares por área (`clubs`, `competitions`, `games`, `members`, `documents`, `administrators`) com flags `can_create`, `can_edit`, `can_delete`.

Super-admins (`is_superadmin = 1`) têm acesso total sem verificação de permissões individuais.

---

## Segurança

- Helmet (headers HTTP seguros)
- CORS restrito à origem configurada em `ALLOWED_ORIGIN`
- Rate limiting no login (configurável via env vars)
- Passwords com bcrypt (cost 12)
- Tokens JWT stateless
- Queries parametrizadas (sem SQL injection)
- Validação de input com express-validator em todos os endpoints
- Auditoria de todas as acções admin na tabela `AuditLog`
- MIME type validation nos uploads
