const gameRepository = require('./game.repository');

class GameService {
  async getAllGames() {
    try {
      return await gameRepository.findAll();
    } catch (error) {
      throw new Error(`Erro ao obter jogos: ${error.message}`);
    }
  }

  async getGameById(id) {
    try {
      const game = await gameRepository.findById(id);
      if (!game) {
        throw new Error('Jogo não encontrado');
      }
      return game;
    } catch (error) {
      throw error;
    }
  }

  async createGame(gameData) {
    try {
      const game = await gameRepository.create(gameData);
      // Retorna o jogo com os dados populados
      return await gameRepository.findById(game._id);
    } catch (error) {
      throw new Error(`Erro ao criar jogo: ${error.message}`);
    }
  }

  async updateGame(id, gameData) {
    try {
      const game = await gameRepository.update(id, gameData);
      if (!game) {
        throw new Error('Jogo não encontrado');
      }
      return game;
    } catch (error) {
      throw new Error(`Erro ao atualizar jogo: ${error.message}`);
    }
  }

  async deleteGame(id) {
    try {
      const game = await gameRepository.delete(id);
      if (!game) {
        throw new Error('Jogo não encontrado');
      }
      return game;
    } catch (error) {
      throw new Error(`Erro ao eliminar jogo: ${error.message}`);
    }
  }

  async getGamesByCompetition(competitionId) {
    try {
      return await gameRepository.findByCompetition(competitionId);
    } catch (error) {
      throw new Error(`Erro ao buscar jogos por competição: ${error.message}`);
    }
  }

  async getGamesByClub(clubId) {
    try {
      return await gameRepository.findByClub(clubId);
    } catch (error) {
      throw new Error(`Erro ao buscar jogos por clube: ${error.message}`);
    }
  }

  async getGamesByStatus(status) {
    try {
      return await gameRepository.findByStatus(status);
    } catch (error) {
      throw new Error(`Erro ao buscar jogos por estado: ${error.message}`);
    }
  }
}

module.exports = new GameService();