require('dotenv').config();

// Fail-fast: sem um segredo JWT forte, a autenticação inteira fica comprometida.
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
    console.error('FATAL: JWT_SECRET is missing or too short (min. 32 chars). Set it in .env before starting.');
    process.exit(1);
}

const app = require('./app');
const { testConnection, closePool } = require('./infrastructure/database/connection');

const PORT = process.env.PORT || 3000;

async function start() {
    await testConnection();
    console.log('Database connection established.');

    const server = app.listen(PORT, () => {
        console.log(`FPB API running on http://localhost:${PORT}/api/v1`);
    });

    function gracefulShutdown(signal) {
        console.log(`\n${signal} received. Shutting down gracefully...`);
        server.close(async () => {
            await closePool();
            console.log('Server and DB pool closed.');
            process.exit(0);
        });
        setTimeout(() => process.exit(1), 10000);
    }

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));
}

start().catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
});
