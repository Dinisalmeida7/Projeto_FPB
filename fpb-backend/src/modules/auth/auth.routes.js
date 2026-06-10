const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { loginHandler, logoutHandler } = require('./auth.controller');

const router = Router();

router.post('/login', loginHandler);
router.post('/logout', authenticate, logoutHandler);

module.exports = router;
