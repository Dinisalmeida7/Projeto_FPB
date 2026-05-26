const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome do clube é obrigatório'],
    trim: true
  },
  city: {
    type: String,
    required: [true, 'Cidade é obrigatória'],
    trim: true
  },
  foundedYear: {
    type: Number,
    required: [true, 'Ano de fundação é obrigatório'],
    min: [1800, 'Ano deve ser superior a 1800']
  },
  logo: {
    type: String,
    default: ''
  },
  stadium: {
    type: String,
    default: ''
  },
  email: {
    type: String,
    trim: true,
    lowercase: true
  },
  phone: {
    type: String,
    trim: true
  },
  website: {
    type: String,
    trim: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Club', clubSchema);