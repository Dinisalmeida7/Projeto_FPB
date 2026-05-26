const express = require('express');
const router = express.Router();
const competitionController = require('./competition.controller');

// Rotas de Competições
router.get('/', competitionController.getAllCompetitions.bind(competitionController));
router.get('/:id', competitionController.getCompetitionById.bind(competitionController));
router.post('/', competitionController.createCompetition.bind(competitionController));
router.put('/:id', competitionController.updateCompetition.bind(competitionController));
router.delete('/:id', competitionController.deleteCompetition.bind(competitionController));

module.exports = router;