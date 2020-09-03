module.exports = {
  port: process.env.MCMAFIA_PORT || 3000,
  mongoUri: process.env.MCMAFIA_MONGO_URI || 'mongodb://localhost',
  database: process.env.MCMAFIA_DATABASE || 'mcmafia'
};