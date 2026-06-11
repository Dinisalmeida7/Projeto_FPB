const express = require('express');
const cors = require('cors');
const compression = require('compression');
const { errorHandler } = require('./api/middleware/errorHandler');

const app = express();

app.use(compression());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1', require('./api/routes'));

app.get('/health', (req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

module.exports = app;
