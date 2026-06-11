const competitionRepository = require('./competition.repository');

class CompetitionService {
  async getAllCompetitions() {
    try {
      return await competitionRepository.findAll();
    } catch (error) {
      throw new Error(`Erro ao obter competições: ${error.message}`);
    }
  }

  async getCompetitionById(id) {
    try {
      const competition = await competitionRepository.findById(id);
      if (!competition) {
        throw new Error('Competição não encontrada');
      }
      return competition;
    } catch (error) {
      throw error;
    }
  }

  async createCompetition(competitionData) {
    try {
      return await competitionRepository.create(competitionData);
    } catch (error) {
      throw new Error(`Erro ao criar competição: ${error.message}`);
    }
  }

  async updateCompetition(id, competitionData) {
    try {
      const competition = await competitionRepository.update(id, competitionData);
      if (!competition) {
        throw new Error('Competição não encontrada');
      }
      return competition;
    } catch (error) {
      throw new Error(`Erro ao atualizar competição: ${error.message}`);
    }
  }

  async deleteCompetition(id) {
    try {
      const competition = await competitionRepository.delete(id);
      if (!competition) {
        throw new Error('Competição não encontrada');
      }
      return competition;
    } catch (error) {
      throw new Error(`Erro ao eliminar competição: ${error.message}`);
    }
  }

  async getCompetitionsBySeason(season) {
    try {
      return await competitionRepository.findBySeason(season);
    } catch (error) {
      throw new Error(`Erro ao buscar competições por época: ${error.message}`);
    }
  }

  async getCompetitionsByType(type) {
    try {
      return await competitionRepository.findByType(type);
    } catch (error) {
      throw new Error(`Erro ao buscar competições por tipo: ${error.message}`);
    }
  }
}

module.exports = new CompetitionService();