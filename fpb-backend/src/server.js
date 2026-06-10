require('dotenv').config();
const app = require('./app');
const { testConnection } = require('./infrastructure/database/connection');

const PORT = process.env.PORT || 3000;

async function start() {
    await testConnection();
    console.log('Database connection established.');

    app.listen(PORT, () => {
        console.log(`FPB API running on http://localhost:${PORT}/api/v1`);
    });
}

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
