const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, listRules, resultRules, refereeRules, athleteCreateRules, athleteUpdateRules } = require('../../shared/validators/game.validator');
const ctrl = require('./games.controller');

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('games', 'create'), createRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('games', 'edit'), updateRules, validate, ctrl.update);
router.put('/:id/result', authenticate, requirePermission('games', 'edit'), resultRules, validate, ctrl.registerResult);
router.delete('/:id', authenticate, requirePermission('games', 'delete'), ctrl.remove);

// Juízes do jogo (CU19) — fazem parte da gestão de jogos, logo área 'games'
router.post('/:id/referees', authenticate, requirePermission('games', 'edit'), refereeRules, validate, ctrl.addReferee);
router.delete('/:id/referees/:refereeId', authenticate, requirePermission('games', 'edit'), ctrl.removeReferee);

// Participação e estatísticas de atletas (T4: AtletaJogo)
router.post('/:id/athletes', authenticate, requirePermission('games', 'edit'), athleteCreateRules, validate, ctrl.addAthlete);
router.put('/:id/athletes/:athleteId', authenticate, requirePermission('games', 'edit'), athleteUpdateRules, validate, ctrl.updateAthlete);
router.delete('/:id/athletes/:athleteId', authenticate, requirePermission('games', 'edit'), ctrl.removeAthlete);

module.exports = router;
