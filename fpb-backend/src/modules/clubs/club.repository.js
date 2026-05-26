const Club = require('../../shared/models/Club');

class ClubRepository {
  async findAll() {
    return await Club.find().sort({ name: 1 });
  }

  async findById(id) {
    return await Club.findById(id);
  }

  async create(clubData) {
    const club = new Club(clubData);
    return await club.save();
  }

  async update(id, clubData) {
    return await Club.findByIdAndUpdate(id, clubData, { 
      new: true, 
      runValidators: true 
    });
  }

  async delete(id) {
    return await Club.findByIdAndDelete(id);
  }

  async findByCity(city) {
    return await Club.find({ city: new RegExp(city, 'i') });
  }
}

module.exports = new ClubRepository();