const { Router } = require('express');
const { authenticate } = require('../../api/middleware/auth');
const { loginLimiter } = require('../../api/middleware/rateLimiter');
const { validate } = require('../../api/middleware/validate');
const { loginRules } = require('../../shared/validators/auth.validator');
const { loginHandler, logoutHandler } = require('./auth.controller');

const router = Router();

router.post('/login', loginLimiter, loginRules, validate, loginHandler);
router.post('/logout', authenticate, logoutHandler);

module.exports = router;
