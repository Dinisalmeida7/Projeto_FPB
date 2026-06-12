const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { errorHandler, notFoundHandler } = require('./api/middleware/errorHandler');
const { apiLimiter } = require('./api/middleware/rateLimiter');

const app = express();

// Atrás de um reverse proxy (nginx/caddy com TLS), definir TRUST_PROXY=1 (n.º de hops)
// para que req.ip e o rate limiting usem o IP real do cliente e não o do proxy.
const trustProxy = parseInt(process.env.TRUST_PROXY);
if (trustProxy > 0) app.set('trust proxy', trustProxy);

app.use(helmet());
app.use(compression());
app.use(cors({
    origin: process.env.ALLOWED_ORIGIN || 'http://localhost:5173',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(express.json({ limit: process.env.REQUEST_BODY_LIMIT || '1mb' }));
app.use(express.urlencoded({ extended: true, limit: process.env.REQUEST_BODY_LIMIT || '1mb' }));

app.use('/api/v1', apiLimiter, require('./api/routes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(notFoundHandler);
app.use(errorHandler);

module.exports = app;
