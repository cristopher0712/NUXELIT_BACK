const mongoose = require('mongoose');
const logger = require('../utils/logger');

let cachedDb = null;

const connectDB = async () => {
  if (cachedDb) {
    return cachedDb;
  }
  
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // Serverless best practice options
      serverSelectionTimeoutMS: 5000
    });
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    cachedDb = conn;
    return conn;
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    // En Vercel no podemos hacer process.exit(1)
    throw error;
  }
};

module.exports = { connectDB };
