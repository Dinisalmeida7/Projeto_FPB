const express = require('express');
const router = express.Router();
const gameController = require('./game.controller');

// Rotas de Jogos
router.get('/', gameController.getAllGames.bind(gameController));
router.get('/:id', gameController.getGameById.bind(gameController));
router.post('/', gameController.createGame.bind(gameController));
router.put('/:id', gameController.updateGame.bind(gameController));
router.delete('/:id', gameController.deleteGame.bind(gameController));

// Rotas especiais
router.get('/competition/:competitionId', gameController.getGamesByCompetition.bind(gameController));
router.get('/club/:clubId', gameController.getGamesByClub.bind(gameController));

module.exports = router;