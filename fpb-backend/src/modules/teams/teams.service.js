const AppError = require('../../shared/utils/AppError');
const repo = require('./teams.repository');

async function getAll(filters) { return repo.findAll(filters); }

async function getById(id) {
    const team = await repo.findById(id);
    if (!team) throw new AppError('Team not found.', 404);
    return team;
}

async function createTeam(data) {
    // T4 (nota da entidade Equipa): uma equipa pertence a um clube OU a uma
    // associação (seleções distritais) — pelo menos um tem de estar preenchido.
    if (!data.club_id && !data.association_id) {
        throw new AppError('A team must belong to a club or an association (club_id or association_id required).', 400);
    }
    return repo.create(data); // FK inexistente → ER_NO_REFERENCED_ROW → 400
}

async function updateTeam(id, data) {
    const current = await getById(id);

    // Garante que a regra clube-ou-associação se mantém após o update
    const club = data.club_id !== undefined ? data.club_id : current.club_id;
    const association = data.association_id !== undefined ? data.association_id : current.association_id;
    if (!club && !association) {
        throw new AppError('A team must belong to a club or an association (club_id or association_id required).', 400);
    }

    return repo.update(id, data);
}

async function deleteTeam(id) {
    await getById(id);
    await repo.remove(id); // equipa com jogos → ER_ROW_IS_REFERENCED → 409
}

// ---------- Treinadores ----------

async function addCoach(teamId, coachId) {
    await getById(teamId);
    const coach = await repo.findCoachById(coachId);
    if (!coach) throw new AppError('Coach not found.', 404);
    if (!coach.is_active) throw new AppError('Coach is not active.', 400);

    await repo.addCoach(teamId, coachId); // duplicado → ER_DUP_ENTRY → 409
    return {
        team_id: Number(teamId),
        coach_id: coach.id,
        coach_name: `${coach.first_name} ${coach.last_name}`,
        level: coach.level,
    };
}

async function removeCoach(teamId, coachId) {
    await getById(teamId);
    const removed = await repo.removeCoach(teamId, coachId);
    if (!removed) throw new AppError('Coach is not assigned to this team.', 404);
}

// ---------- Plantel ----------

async function addAthlete(teamId, data) {
    await getById(teamId);
    const athlete = await repo.findAthleteById(data.athlete_id);
    if (!athlete) throw new AppError('Athlete not found.', 404);

    await repo.addAthlete(teamId, data); // duplicado na época → ER_DUP_ENTRY → 409
    return {
        team_id: Number(teamId),
        athlete_id: athlete.id,
        athlete_name: `${athlete.first_name} ${athlete.last_name}`,
        season: data.season,
        jersey_number: data.jersey_number ?? null,
    };
}

async function removeAthlete(teamId, athleteId, season) {
    await getById(teamId);
    const removed = await repo.removeAthlete(teamId, athleteId, season);
    if (!removed) throw new AppError('Athlete is not registered in this team.', 404);
}

module.exports = {
    getAll, getById, createTeam, updateTeam, deleteTeam,
    addCoach, removeCoach, addAthlete, removeAthlete,
};
