const Competition = require('../../shared/models/Competition');

class CompetitionRepository {
  async findAll() {
    return await Competition.find().sort({ startDate: -1 });
  }

  async findById(id) {
    return await Competition.findById(id);
  }

  async create(competitionData) {
    const competition = new Competition(competitionData);
    return await competition.save();
  }

  async update(id, competitionData) {
    return await Competition.findByIdAndUpdate(id, competitionData, { 
      new: true, 
      runValidators: true 
    });
  }

  async delete(id) {
    return await Competition.findByIdAndDelete(id);
  }

  async findBySeason(season) {
    return await Competition.find({ season: new RegExp(season, 'i') });
  }

  async findByType(type) {
    return await Competition.find({ type });
  }
}

module.exports = new CompetitionRepository();