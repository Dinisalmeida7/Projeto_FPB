const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, listRules, coachRules, athleteRules } = require('../../shared/validators/team.validator');
const ctrl = require('./teams.controller');

// Equipas pertencem ao grupo "Clubes, Equipas e Associações" (T4 — Grupo 1),
// pelo que a gestão é gated pela área de permissões 'clubs' (CU22 define 6 áreas fixas).

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);

router.post('/', authenticate, requirePermission('clubs', 'create'), createRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('clubs', 'edit'), updateRules, validate, ctrl.update);
router.delete('/:id', authenticate, requirePermission('clubs', 'delete'), ctrl.remove);

// Treinadores da equipa (T4: TreinadorEquipa)
router.post('/:id/coaches', authenticate, requirePermission('clubs', 'edit'), coachRules, validate, ctrl.addCoach);
router.delete('/:id/coaches/:coachId', authenticate, requirePermission('clubs', 'edit'), ctrl.removeCoach);

// Plantel por época (T4: AtletaEquipa)
router.post('/:id/athletes', authenticate, requirePermission('clubs', 'edit'), athleteRules, validate, ctrl.addAthlete);
router.delete('/:id/athletes/:athleteId', authenticate, requirePermission('clubs', 'edit'), ctrl.removeAthlete);

module.exports = router;
