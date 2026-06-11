const express = require('express');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const { errorHandler } = require('./api/middleware/errorHandler');

const app = express();

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

app.use('/api/v1', require('./api/routes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
