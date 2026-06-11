const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const clubRoutes = require('./modules/clubs/club.routes');
const competitionRoutes = require('./modules/competitions/competition.routes');
const gameRoutes = require('./modules/games/game.routes');

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log de requisições (desenvolvimento)
if (process.env.NODE_ENV === 'development') {
  app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
  });
}

// Rota principal
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'API FPB - Federação Portuguesa de Basquetebol',
    version: '1.0.0',
    endpoints: {
      clubs: '/api/clubs',
      competitions: '/api/competitions',
      games: '/api/games'
    }
  });
});

// Rotas da API
app.use('/api/clubs', clubRoutes);
app.use('/api/competitions', competitionRoutes);
app.use('/api/games', gameRoutes);

// Rota para 404
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros global
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Erro interno do servidor',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

module.exports = app;