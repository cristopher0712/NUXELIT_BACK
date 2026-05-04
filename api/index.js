const app = require('../src/app');
const { connectDB } = require('../src/config/database');

// Export a wrapper that ensures DB is connected before handling the request
module.exports = async (req, res) => {
  try {
    await connectDB();
  } catch (error) {
    console.error('Failed to connect to database in serverless function:', error);
    // Don't crash the lambda, return a 500 error gracefully
    return res.status(500).json({ error: 'Database connection failed', details: error.message });
  }
  
  return app(req, res);
};
