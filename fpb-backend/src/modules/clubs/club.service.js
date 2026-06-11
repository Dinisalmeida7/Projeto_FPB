const clubRepository = require('./club.repository');

class ClubService {
  async getAllClubs() {
    try {
      return await clubRepository.findAll();
    } catch (error) {
      throw new Error(`Erro ao obter clubes: ${error.message}`);
    }
  }

  async getClubById(id) {
    try {
      const club = await clubRepository.findById(id);
      if (!club) {
        throw new Error('Clube não encontrado');
      }
      return club;
    } catch (error) {
      throw error;
    }
  }

  async createClub(clubData) {
    try {
      return await clubRepository.create(clubData);
    } catch (error) {
      throw new Error(`Erro ao criar clube: ${error.message}`);
    }
  }

  async updateClub(id, clubData) {
    try {
      const club = await clubRepository.update(id, clubData);
      if (!club) {
        throw new Error('Clube não encontrado');
      }
      return club;
    } catch (error) {
      throw new Error(`Erro ao atualizar clube: ${error.message}`);
    }
  }

  async deleteClub(id) {
    try {
      const club = await clubRepository.delete(id);
      if (!club) {
        throw new Error('Clube não encontrado');
      }
      return club;
    } catch (error) {
      throw new Error(`Erro ao eliminar clube: ${error.message}`);
    }
  }

  async getClubsByCity(city) {
    try {
      return await clubRepository.findByCity(city);
    } catch (error) {
      throw new Error(`Erro ao buscar clubes por cidade: ${error.message}`);
    }
  }
}

module.exports = new ClubService();