const asyncHandler = require('../../shared/utils/asyncHandler');
const { success, paginate } = require('../../shared/utils/responseFormatter');
const { logAction } = require('../../shared/utils/auditLogger');
const svc = require('./teams.service');

const getAll = asyncHandler(async (req, res) => {
    const { search, club_id, association_id, gender, age_group, is_active, page = 1, limit = 20 } = req.query;
    const { rows, total } = await svc.getAll({ search, club_id, association_id, gender, age_group, is_active, page, limit });
    return paginate(res, rows, total, page, limit);
});

const getById = asyncHandler(async (req, res) => {
    return success(res, await svc.getById(req.params.id));
});

const create = asyncHandler(async (req, res) => {
    const team = await svc.createTeam(req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'Team', team.id, { name: team.name }, req.ip);
    return success(res, team, 201);
});

const update = asyncHandler(async (req, res) => {
    const team = await svc.updateTeam(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'UPDATE', 'Team', team.id, req.body, req.ip);
    return success(res, team);
});

const remove = asyncHandler(async (req, res) => {
    await svc.deleteTeam(req.params.id);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'Team', parseInt(req.params.id), null, req.ip);
    return res.status(204).end();
});

// ---------- Treinadores ----------

const addCoach = asyncHandler(async (req, res) => {
    const assignment = await svc.addCoach(req.params.id, req.body.coach_id);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'CoachTeam', parseInt(req.params.id),
        { coach_id: req.body.coach_id }, req.ip);
    return success(res, assignment, 201);
});

const removeCoach = asyncHandler(async (req, res) => {
    await svc.removeCoach(req.params.id, req.params.coachId);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'CoachTeam', parseInt(req.params.id),
        { coach_id: parseInt(req.params.coachId) }, req.ip);
    return res.status(204).end();
});

// ---------- Plantel ----------

const addAthlete = asyncHandler(async (req, res) => {
    const registration = await svc.addAthlete(req.params.id, req.body);
    await logAction(req.admin.id, req.admin.email, 'CREATE', 'TeamAthlete', parseInt(req.params.id),
        { athlete_id: req.body.athlete_id, season: req.body.season }, req.ip);
    return success(res, registration, 201);
});

const removeAthlete = asyncHandler(async (req, res) => {
    await svc.removeAthlete(req.params.id, req.params.athleteId, req.query.season);
    await logAction(req.admin.id, req.admin.email, 'DELETE', 'TeamAthlete', parseInt(req.params.id),
        { athlete_id: parseInt(req.params.athleteId), season: req.query.season || 'all' }, req.ip);
    return res.status(204).end();
});

module.exports = { getAll, getById, create, update, remove, addCoach, removeCoach, addAthlete, removeAthlete };
