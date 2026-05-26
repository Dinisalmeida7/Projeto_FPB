const mongoose = require('mongoose');

const gameSchema = new mongoose.Schema({
  competition: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Competition',
    required: [true, 'Competição é obrigatória']
  },
  homeClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Clube da casa é obrigatório']
  },
  awayClub: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Club',
    required: [true, 'Clube visitante é obrigatório'],
    validate: {
      validator: function(value) {
        return !this.homeClub || !value.equals(this.homeClub);
      },
      message: 'Clube da casa e visitante devem ser diferentes'
    }
  },
  date: {
    type: Date,
    required: [true, 'Data do jogo é obrigatória']
  },
  time: {
    type: String,
    required: [true, 'Hora do jogo é obrigatória'],
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)']
  },
  location: {
    type: String,
    required: [true, 'Local do jogo é obrigatório'],
    trim: true
  },
  homeScore: {
    type: Number,
    default: null,
    min: [0, 'Pontuação não pode ser negativa']
  },
  awayScore: {
    type: Number,
    default: null,
    min: [0, 'Pontuação não pode ser negativa']
  },
  status: {
    type: String,
    enum: ['Agendado', 'Em curso', 'Finalizado', 'Adiado', 'Cancelado'],
    default: 'Agendado'
  },
  round: {
    type: Number,
    default: 1
  },
  observations: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Game', gameSchema);