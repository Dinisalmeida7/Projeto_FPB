const competitionService = require('./competition.service');

class CompetitionController {
  async getAllCompetitions(req, res) {
    try {
      const competitions = await competitionService.getAllCompetitions();
      res.status(200).json({
        success: true,
        count: competitions.length,
        data: competitions
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getCompetitionById(req, res) {
    try {
      const competition = await competitionService.getCompetitionById(req.params.id);
      res.status(200).json({
        success: true,
        data: competition
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createCompetition(req, res) {
    try {
      const competition = await competitionService.createCompetition(req.body);
      res.status(201).json({
        success: true,
        message: 'Competição criada com sucesso',
        data: competition
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateCompetition(req, res) {
    try {
      const competition = await competitionService.updateCompetition(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Competição atualizada com sucesso',
        data: competition
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteCompetition(req, res) {
    try {
      await competitionService.deleteCompetition(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Competição eliminada com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new CompetitionController();