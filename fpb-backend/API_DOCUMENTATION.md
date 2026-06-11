# API FPB - Documentação dos Endpoints

## Base URL
```
http://localhost:8001/api
```

---

## 📋 Módulo: Clubes

### 1. Listar todos os clubes
```bash
GET /api/clubs
```

**Resposta de sucesso (200):**
```json
{
  "success": true,
  "count": 2,
  "data": [...]
}
```

### 2. Obter clube por ID
```bash
GET /api/clubs/:id
```

### 3. Criar novo clube
```bash
POST /api/clubs
Content-Type: application/json

{
  "name": "SL Benfica",
  "city": "Lisboa",
  "foundedYear": 1904,
  "stadium": "Pavilhão Fidelidade",
  "email": "basquete@slbenfica.pt",
  "phone": "+351 217 219 500",
  "website": "https://www.slbenfica.pt",
  "logo": ""
}
```

### 4. Atualizar clube
```bash
PUT /api/clubs/:id
Content-Type: application/json

{
  "name": "SL Benfica",
  "city": "Lisboa"
}
```

### 5. Eliminar clube
```bash
DELETE /api/clubs/:id
```

---

## 🏆 Módulo: Competições

### 1. Listar todas as competições
```bash
GET /api/competitions
```

### 2. Obter competição por ID
```bash
GET /api/competitions/:id
```

### 3. Criar nova competição
```bash
POST /api/competitions
Content-Type: application/json

{
  "name": "Liga Portuguesa de Basquetebol",
  "season": "2024/2025",
  "type": "Liga",
  "startDate": "2024-09-01",
  "endDate": "2025-05-31",
  "description": "Campeonato nacional da primeira divisão"
}
```

**Tipos de competição disponíveis:**
- Liga
- Taça
- Supertaça
- Torneio
- Amigável

### 4. Atualizar competição
```bash
PUT /api/competitions/:id
Content-Type: application/json
```

### 5. Eliminar competição
```bash
DELETE /api/competitions/:id
```

---

## ⚽ Módulo: Jogos

### 1. Listar todos os jogos
```bash
GET /api/games
```

### 2. Obter jogo por ID
```bash
GET /api/games/:id
```

### 3. Criar novo jogo
```bash
POST /api/games
Content-Type: application/json

{
  "competition": "6a15c0c396879524c7420413",
  "homeClub": "6a15c060f5ff0562ffe116c6",
  "awayClub": "6a15c065f5ff0562ffe116c7",
  "date": "2024-10-15",
  "time": "20:30",
  "location": "Pavilhão Fidelidade",
  "status": "Agendado",
  "round": 1,
  "homeScore": null,
  "awayScore": null,
  "observations": ""
}
```

**Status disponíveis:**
- Agendado
- Em curso
- Finalizado
- Adiado
- Cancelado

### 4. Atualizar jogo (adicionar resultado)
```bash
PUT /api/games/:id
Content-Type: application/json

{
  "homeScore": 85,
  "awayScore": 78,
  "status": "Finalizado"
}
```

### 5. Eliminar jogo
```bash
DELETE /api/games/:id
```

### 6. Listar jogos por competição
```bash
GET /api/games/competition/:competitionId
```

### 7. Listar jogos por clube
```bash
GET /api/games/club/:clubId
```

---

## 📝 Exemplos de uso com curl

### Criar um clube:
```bash
curl -X POST http://localhost:8001/api/clubs \
  -H "Content-Type: application/json" \
  -d '{
    "name": "FC Porto",
    "city": "Porto",
    "foundedYear": 1893
  }'
```

### Criar uma competição:
```bash
curl -X POST http://localhost:8001/api/competitions \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Taça de Portugal",
    "season": "2024/2025",
    "type": "Taça",
    "startDate": "2024-11-01",
    "endDate": "2025-04-30"
  }'
```

### Criar um jogo:
```bash
curl -X POST http://localhost:8001/api/games \
  -H "Content-Type: application/json" \
  -d '{
    "competition": "ID_DA_COMPETICAO",
    "homeClub": "ID_CLUBE_CASA",
    "awayClub": "ID_CLUBE_VISITANTE",
    "date": "2024-12-15",
    "time": "20:30",
    "location": "Pavilhão XYZ",
    "round": 1
  }'
```

---

## ✅ Estrutura de Resposta

### Sucesso:
```json
{
  "success": true,
  "message": "Operação realizada com sucesso",
  "data": {...}
}
```

### Erro:
```json
{
  "success": false,
  "message": "Descrição do erro"
}
```

---

## 🔧 Tecnologias Utilizadas

- **Backend**: Node.js + Express
- **Base de Dados**: MongoDB + Mongoose
- **Porta**: 8001
- **Ambiente**: Development

---

## 📦 Estrutura do Projeto

```
fpb-backend/
├── src/
│   ├── app.js                    # Configuração do Express
│   ├── server.js                 # Início do servidor
│   ├── infrastructure/
│   │   └── database/
│   │       └── connection.js     # Conexão MongoDB
│   ├── shared/
│   │   └── models/
│   │       ├── Club.js           # Modelo de Clube
│   │       ├── Competition.js    # Modelo de Competição
│   │       └── Game.js           # Modelo de Jogo
│   └── modules/
│       ├── clubs/
│       │   ├── club.repository.js
│       │   ├── club.service.js
│       │   ├── club.controller.js
│       │   └── club.routes.js
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
└── package.json
```

---

## 🚀 Como Executar

1. **Instalar dependências:**
```bash
cd /app/fpb-backend
yarn install
```

2. **Iniciar servidor:**
```bash
npm start
# ou
npm run dev  # com nodemon para hot reload
```

3. **Verificar status:**
```bash
sudo supervisorctl status fpb-backend
```

---

## 📊 Modelos de Dados

### Club (Clube)
- name: String (obrigatório)
- city: String (obrigatório)
- foundedYear: Number (obrigatório)
- stadium: String
- email: String
- phone: String
- website: String
- logo: String
- active: Boolean

### Competition (Competição)
- name: String (obrigatório)
- season: String (obrigatório)
- type: Enum (obrigatório)
- startDate: Date (obrigatório)
- endDate: Date (obrigatório)
- description: String
- active: Boolean

### Game (Jogo)
- competition: ObjectId (ref: Competition)
- homeClub: ObjectId (ref: Club)
- awayClub: ObjectId (ref: Club)
- date: Date (obrigatório)
- time: String (HH:MM)
- location: String (obrigatório)
- homeScore: Number
- awayScore: Number
- status: Enum
- round: Number
- observations: String

---

**Desenvolvido para a Federação Portuguesa de Basquetebol (FPB)**
