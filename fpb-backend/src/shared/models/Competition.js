const mongoose = require('mongoose');

const competitionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome da competição é obrigatório'],
    trim: true
  },
  season: {
    type: String,
    required: [true, 'Época é obrigatória'],
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Tipo de competição é obrigatório'],
    enum: ['Liga', 'Taça', 'Supertaça', 'Torneio', 'Amigável'],
    default: 'Liga'
  },
  startDate: {
    type: Date,
    required: [true, 'Data de início é obrigatória']
  },
  endDate: {
    type: Date,
    required: [true, 'Data de fim é obrigatória'],
    validate: {
      validator: function(value) {
        return value > this.startDate;
      },
      message: 'Data de fim deve ser posterior à data de início'
    }
  },
  description: {
    type: String,
    default: ''
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Competition', competitionSchema);