const app = require('../src/app');
const { connectDB } = require('../src/config/database');

// Connect to MongoDB using the cached connection logic
connectDB().catch(console.error);

// Export the Express API
module.exports = app;
