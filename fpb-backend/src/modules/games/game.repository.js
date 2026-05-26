const Game = require('../../shared/models/Game');

class GameRepository {
  async findAll() {
    return await Game.find()
      .populate('competition', 'name season type')
      .populate('homeClub', 'name city logo')
      .populate('awayClub', 'name city logo')
      .sort({ date: -1 });
  }

  async findById(id) {
    return await Game.findById(id)
      .populate('competition', 'name season type')
      .populate('homeClub', 'name city logo')
      .populate('awayClub', 'name city logo');
  }

  async create(gameData) {
    const game = new Game(gameData);
    return await game.save();
  }

  async update(id, gameData) {
    return await Game.findByIdAndUpdate(id, gameData, { 
      new: true, 
      runValidators: true 
    })
      .populate('competition', 'name season type')
      .populate('homeClub', 'name city logo')
      .populate('awayClub', 'name city logo');
  }

  async delete(id) {
    return await Game.findByIdAndDelete(id);
  }

  async findByCompetition(competitionId) {
    return await Game.find({ competition: competitionId })
      .populate('homeClub', 'name city logo')
      .populate('awayClub', 'name city logo')
      .sort({ date: 1 });
  }

  async findByClub(clubId) {
    return await Game.find({
      $or: [{ homeClub: clubId }, { awayClub: clubId }]
    })
      .populate('competition', 'name season type')
      .populate('homeClub', 'name city logo')
      .populate('awayClub', 'name city logo')
      .sort({ date: -1 });
  }

  async findByStatus(status) {
    return await Game.find({ status })
      .populate('competition', 'name season type')
      .populate('homeClub', 'name city logo')
      .populate('awayClub', 'name city logo')
      .sort({ date: 1 });
  }
}

module.exports = new GameRepository();