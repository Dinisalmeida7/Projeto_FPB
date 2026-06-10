const { Router } = require('express');

const router = Router();

router.use('/auth',           require('../../modules/auth/auth.routes'));
router.use('/clubs',          require('../../modules/clubs/clubs.routes'));
router.use('/members',        require('../../modules/members/members.routes'));
router.use('/competitions',   require('../../modules/competitions/competitions.routes'));
router.use('/games',          require('../../modules/games/games.routes'));
router.use('/documents',      require('../../modules/documents/documents.routes'));
router.use('/search',         require('../../modules/search/search.routes'));
router.use('/administrators', require('../../modules/administrators/administrators.routes'));

module.exports = router;
