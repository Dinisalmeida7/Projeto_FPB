# Backend FPB - Federação Portuguesa de Basquetebol

Backend funcional para gestão de dados da Federação Portuguesa de Basquetebol, cobrindo os módulos de **Clubes**, **Competições** e **Jogos**.

## 🚀 Status do Projeto

✅ **Backend Implementado e Funcional**

- ✅ Módulo de Clubes (CRUD completo)
- ✅ Módulo de Competições (CRUD completo)
- ✅ Módulo de Jogos (CRUD completo)
- ✅ Conexão MongoDB configurada
- ✅ Estrutura profissional (Repository → Service → Controller)
- ✅ Validações de dados
- ✅ Relacionamentos entre entidades (populate)

---

## 🛠 Tecnologias

- **Runtime**: Node.js
- **Framework**: Express 5.2
- **Base de Dados**: MongoDB + Mongoose
- **Outros**: CORS, dotenv, bcryptjs, JWT (preparado)

---

## 📦 Instalação

```bash
cd /app/fpb-backend
yarn install
```

---

## ▶️ Executar o Servidor

### Desenvolvimento (com nodemon):
```bash
npm run dev
```

### Produção:
```bash
npm start
```

### Via Supervisor (recomendado):
```bash
sudo supervisorctl start fpb-backend
sudo supervisorctl status fpb-backend
```

---

## 📡 Endpoints Disponíveis

### Base URL: `http://localhost:8001`

#### Clubes
- `GET /api/clubs` - Listar todos os clubes
- `GET /api/clubs/:id` - Obter clube por ID
- `POST /api/clubs` - Criar novo clube
- `PUT /api/clubs/:id` - Atualizar clube
- `DELETE /api/clubs/:id` - Eliminar clube

#### Competições
- `GET /api/competitions` - Listar todas as competições
- `GET /api/competitions/:id` - Obter competição por ID
- `POST /api/competitions` - Criar nova competição
- `PUT /api/competitions/:id` - Atualizar competição
- `DELETE /api/competitions/:id` - Eliminar competição

#### Jogos
- `GET /api/games` - Listar todos os jogos
- `GET /api/games/:id` - Obter jogo por ID
- `POST /api/games` - Criar novo jogo
- `PUT /api/games/:id` - Atualizar jogo
- `DELETE /api/games/:id` - Eliminar jogo
- `GET /api/games/competition/:competitionId` - Jogos por competição
- `GET /api/games/club/:clubId` - Jogos por clube

📖 **Documentação completa**: Ver [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

## 🧪 Testes Rápidos

### Verificar servidor:
```bash
curl http://localhost:8001/
```

### Criar um clube:
```bash
curl -X POST http://localhost:8001/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "SL Benfica",
    "city": "Lisboa",
    "foundedYear": 1904
  }'
```

### Listar clubes:
```bash
curl http://localhost:8001/api/clubs | jq .
```

---

## 📂 Estrutura do Projeto

```
fpb-backend/
├── src/
│   ├── app.js                          # Configuração Express
│   ├── server.js                       # Entry point
│   ├── infrastructure/
│   │   └── database/
│   │       └── connection.js           # Conexão MongoDB
│   ├── shared/
│   │   └── models/
│   │       ├── Club.js                 # Schema Mongoose
│   │       ├── Competition.js
│   │       └── Game.js
│   └── modules/
│       ├── clubs/
│       │   ├── club.repository.js      # Acesso aos dados
│       │   ├── club.service.js         # Lógica de negócio
│       │   ├── club.controller.js      # Handlers das rotas
│       │   └── club.routes.js          # Definição de rotas
│       ├── competitions/
│       │   ├── competition.repository.js
│       │   ├── competition.service.js
│       │   ├── competition.controller.js
│       │   └── competition.routes.js
│       └── games/
│           ├── game.repository.js
│           ├── game.service.js
│           ├── game.controller.js
│           └── game.routes.js
├── .env                                # Variáveis de ambiente
├── package.json
└── README.md
```

---

## ⚙️ Configuração (.env)

```env
PORT=8001
MONGO_URL=mongodb://localhost:27017/fpb_db
NODE_ENV=development
```

---

## 🎯 Funcionalidades Implementadas

### ✅ Módulo Clubes
- CRUD completo
- Validação de dados obrigatórios
- Campos: nome, cidade, ano fundação, pavilhão, email, telefone, website, logo

### ✅ Módulo Competições
- CRUD completo
- Tipos: Liga, Taça, Supertaça, Torneio, Amigável
- Validação de datas (fim > início)
- Campos: nome, época, tipo, datas, descrição

### ✅ Módulo Jogos
- CRUD completo
- Relacionamentos com Clubes e Competições (populate automático)
- Status: Agendado, Em curso, Finalizado, Adiado, Cancelado
- Validação: clubes casa e visitante diferentes
- Campos: competição, clubes, data, hora, local, resultado, jornada

---

## 🔧 Logs

### Ver logs do backend:
```bash
tail -f /var/log/supervisor/fpb-backend.out.log
tail -f /var/log/supervisor/fpb-backend.err.log
```

---

## 📊 Base de Dados

### Conexão
- MongoDB rodando em: `mongodb://localhost:27017`
- Database: `fpb_db`

### Collections
- `clubs` - Clubes
- `competitions` - Competições
- `games` - Jogos

---

## 🎓 Padrões Utilizados

- **Repository Pattern**: Abstração do acesso aos dados
- **Service Layer**: Lógica de negócio centralizada
- **Controller**: Handlers HTTP
- **Dependency Injection**: Facilita testes e manutenção
- **Mongoose Populate**: Relacionamentos automáticos

---

## 🚀 Próximos Passos (Opcional)

- [ ] Adicionar autenticação JWT
- [ ] Implementar paginação nas listagens
- [ ] Adicionar filtros e pesquisa
- [ ] Upload de imagens (logos dos clubes)
- [ ] Estatísticas e classificações
- [ ] Testes automatizados
- [ ] Frontend React

---

## 👨‍💻 Autor

**Dinis Almeida**  
Projeto FPB - UTAD 2025/2026

---

## 📄 Licença

Este projeto faz parte do trabalho académico da UTAD.
