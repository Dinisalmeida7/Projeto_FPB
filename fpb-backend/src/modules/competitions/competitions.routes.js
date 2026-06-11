const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { requirePermission } = require('../../api/middleware/permission');
const { validate } = require('../../api/middleware/validate');
const { createRules, updateRules, listRules } = require('../../shared/validators/competition.validator');
const ctrl = require('./competitions.controller');

const router = Router();

router.get('/', listRules, validate, ctrl.getAll);
router.get('/:id', ctrl.getById);
router.get('/:id/standings', ctrl.getStandings);

router.post('/', authenticate, requirePermission('competitions', 'create'), createRules, validate, ctrl.create);
router.put('/:id', authenticate, requirePermission('competitions', 'edit'), updateRules, validate, ctrl.update);
router.delete('/:id', authenticate, requirePermission('competitions', 'delete'), ctrl.remove);
router.post('/:id/teams', authenticate, requirePermission('competitions', 'edit'), ctrl.addTeam);
router.delete('/:id/teams/:teamId', authenticate, requirePermission('competitions', 'edit'), ctrl.removeTeam);

module.exports = router;
