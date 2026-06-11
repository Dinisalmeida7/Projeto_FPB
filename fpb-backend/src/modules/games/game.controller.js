const gameService = require('./game.service');

class GameController {
  async getAllGames(req, res) {
    try {
      const games = await gameService.getAllGames();
      res.status(200).json({
        success: true,
        count: games.length,
        data: games
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getGameById(req, res) {
    try {
      const game = await gameService.getGameById(req.params.id);
      res.status(200).json({
        success: true,
        data: game
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createGame(req, res) {
    try {
      const game = await gameService.createGame(req.body);
      res.status(201).json({
        success: true,
        message: 'Jogo criado com sucesso',
        data: game
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateGame(req, res) {
    try {
      const game = await gameService.updateGame(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Jogo atualizado com sucesso',
        data: game
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteGame(req, res) {
    try {
      await gameService.deleteGame(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Jogo eliminado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async getGamesByCompetition(req, res) {
    try {
      const games = await gameService.getGamesByCompetition(req.params.competitionId);
      res.status(200).json({
        success: true,
        count: games.length,
        data: games
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getGamesByClub(req, res) {
    try {
      const games = await gameService.getGamesByClub(req.params.clubId);
      res.status(200).json({
        success: true,
        count: games.length,
        data: games
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new GameController();