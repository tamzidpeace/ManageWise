require('dotenv').config({
  path: require('path').resolve(__dirname, 'test.env'),
});
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    'Please define the MONGODB_URI environment variable in test.env'
  );
}

/**
 * Connect to the test database
 */
async function connectToTestDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to test database');
  } catch (error) {
    console.error('Error connecting to test database:', error);
    throw error;
  }
}

/**
 * Clear all collections in the test database
 */
async function clearTestDB() {
  try {
    await mongoose.connection.dropDatabase();
  } catch (error) {
    console.error('Error clearing test database:', error);
    throw error;
  }
}

/**
 * Disconnect from the test database
 */
async function disconnectFromTestDB() {
  try {
    await mongoose.disconnect();
    console.log('Disconnected from test database');
  } catch (error) {
    console.error('Error disconnecting from test database:', error);
    throw error;
  }
}

module.exports = {
  connectToTestDB,
  clearTestDB,
  disconnectFromTestDB,
};
