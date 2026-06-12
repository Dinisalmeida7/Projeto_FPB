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
mysql -u root -p fpb_db < src/infrastructure/database/Seed.sql   # dados de demonstração (opcional)
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
| `RATE_LIMIT_GLOBAL_WINDOW_MIN` | Janela do rate limit global em minutos | `15` |
| `RATE_LIMIT_GLOBAL_MAX` | Pedidos máximos por janela (toda a API) | `1000` |
| `TRUST_PROXY` | Nº de hops de reverse proxy confiáveis (1 atrás de nginx; 0 = sem proxy) | `0` |

> `JWT_SECRET` tem de ter pelo menos 32 caracteres — o servidor recusa arrancar caso contrário. Gerar com:
> `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

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
│   │   ├── Schema.sql             # Definição de tabelas e seed do super-admin
│   │   └── Seed.sql               # Dados de demonstração (associações, clubes, equipas, competição)
│   └── storage/
│       └── storage.js             # Multer + deleteFile (whitelist MIME + extensão)
├── modules/
│   ├── auth/                      # Login / Logout
│   ├── associations/              # Associações distritais
│   ├── clubs/                     # Clubes (+ associação e equipas)
│   ├── teams/                     # Equipas + plantel (atletas) + treinadores
│   ├── competitions/              # Competições + classificações + inscrição de equipas
│   ├── games/                     # Jogos + resultados + juízes + estatísticas de atletas
│   ├── members/                   # Pessoas e roles (atletas, juízes, treinadores, dirigentes)
│   ├── documents/                 # Documentos + categorias (upload/download)
│   ├── administrators/            # Administradores, permissões e log de auditoria (/logs)
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

A documentação completa de todos os endpoints (pedidos, respostas, permissões) está em
[API_DOCUMENTATION.md](API_DOCUMENTATION.md). Resumo por módulo:

| Módulo | Base | Operações |
|---|---|---|
| Auth | `/api/v1/auth` | login (rate-limited), logout |
| Associações | `/api/v1/associations` | CRUD + ficha com clubes e seleções |
| Clubes | `/api/v1/clubs` | CRUD + ficha com associação e equipas |
| Equipas | `/api/v1/teams` | CRUD + treinadores (`/coaches`) + plantel por época (`/athletes`) |
| Competições | `/api/v1/competitions` | CRUD + `/standings` + inscrição de equipas (`/teams`) |
| Jogos | `/api/v1/games` | CRUD + `/result` + juízes (`/referees`) + estatísticas de atletas (`/athletes`) |
| Membros | `/api/v1/members` | CRUD + roles dedicados (`/roles/:role`) |
| Documentos | `/api/v1/documents` | CRUD + `/download` + categorias (`/categories`) |
| Pesquisa | `/api/v1/search` | Pesquisa global por tipo de entidade |
| Administradores | `/api/v1/administrators` | CRUD (delete = desativação) + permissões |
| Auditoria | `/api/v1/logs` | Consulta do log de auditoria |

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
  "meta": { "total": 100, "page": 1, "limit": 20, "pages": 5 }
}
```

**Erro (envelope uniforme):**
```json
{ "error": "Not Found", "message": "Game not found.", "code": 404 }
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
- Rate limiting: login (força bruta) + global em toda a API
- Passwords com bcrypt (cost 12); política de complexidade na criação de admins
- Tokens JWT stateless; `JWT_SECRET` forte obrigatório (validado no arranque)
- Queries parametrizadas + whitelists de identificadores (sem SQL injection)
- Validação de input com express-validator em todos os endpoints
- Auditoria de todas as ações admin na tabela `AuditLog` (consultável em `GET /api/v1/logs`)
- Uploads: whitelist de MIME type **e** extensão, nomes de ficheiro gerados pelo servidor
- Download de documentos confinado ao diretório de uploads (anti path-traversal)
- Anti-escalação de privilégios: só super-admins gerem super-admins; um admin não pode alterar as próprias permissões nem desativar a própria conta

## Produção (HTTPS / reverse proxy)

O TLS não é terminado pela aplicação — em produção a API deve correr atrás de um
reverse proxy (nginx, Caddy, etc.) que faça HTTPS (RNF06). Nessa configuração:

1. Definir `TRUST_PROXY=1` para que `req.ip` e o rate limiting usem o IP real do cliente.
2. Restringir `ALLOWED_ORIGIN` ao domínio do frontend.
3. Alterar a password do super-admin seeded (`admin@fpb.pt`) imediatamente.
4. Configurar backups regulares do MySQL e do diretório `uploads/` (RNF16).
