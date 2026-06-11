const app = require('./app');
const connectDB = require('./infrastructure/database/connection');

const PORT = process.env.PORT || 8001;

// Conectar à base de dados e iniciar servidor
const startServer = async () => {
  try {
    // Conectar ao MongoDB
    await connectDB();
    
    // Iniciar servidor
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`\n🚀 Servidor FPB a correr em http://localhost:${PORT}`);
      console.log(`🎯 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`\n📡 Endpoints disponíveis:`);
      console.log(`   - GET    http://localhost:${PORT}/api/clubs`);
      console.log(`   - POST   http://localhost:${PORT}/api/clubs`);
      console.log(`   - GET    http://localhost:${PORT}/api/competitions`);
      console.log(`   - POST   http://localhost:${PORT}/api/competitions`);
      console.log(`   - GET    http://localhost:${PORT}/api/games`);
      console.log(`   - POST   http://localhost:${PORT}/api/games`);
      console.log(`\n✅ Backend pronto para receber pedidos!\n`);
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error.message);
    process.exit(1);
  }
};

// Tratar encerramento gracioso
process.on('SIGINT', () => {
  console.log('\n🛑 A encerrar servidor...');
  process.exit(0);
});

startServer();