const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URL);
    console.log(`✅ MongoDB conectado: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`❌ Erro ao conectar MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = connectDB;