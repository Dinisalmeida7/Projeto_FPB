const express = require('express');
const router = express.Router();
const clubController = require('./club.controller');

// Rotas de Clubes
router.get('/', clubController.getAllClubs.bind(clubController));
router.get('/:id', clubController.getClubById.bind(clubController));
router.post('/', clubController.createClub.bind(clubController));
router.put('/:id', clubController.updateClub.bind(clubController));
router.delete('/:id', clubController.deleteClub.bind(clubController));

module.exports = router;