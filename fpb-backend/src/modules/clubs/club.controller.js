const clubService = require('./club.service');

class ClubController {
  async getAllClubs(req, res) {
    try {
      const clubs = await clubService.getAllClubs();
      res.status(200).json({
        success: true,
        count: clubs.length,
        data: clubs
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  async getClubById(req, res) {
    try {
      const club = await clubService.getClubById(req.params.id);
      res.status(200).json({
        success: true,
        data: club
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  async createClub(req, res) {
    try {
      const club = await clubService.createClub(req.body);
      res.status(201).json({
        success: true,
        message: 'Clube criado com sucesso',
        data: club
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async updateClub(req, res) {
    try {
      const club = await clubService.updateClub(req.params.id, req.body);
      res.status(200).json({
        success: true,
        message: 'Clube atualizado com sucesso',
        data: club
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  async deleteClub(req, res) {
    try {
      await clubService.deleteClub(req.params.id);
      res.status(200).json({
        success: true,
        message: 'Clube eliminado com sucesso'
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new ClubController();