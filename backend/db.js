
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.ATLAS_URI, {
      serverSelectionTimeoutMS: 1500,
      connectTimeoutMS: 1500,
    });
    console.log('MongoDB database connection established successfully');
    return true;
  } catch (error) {
    console.error('Database connection error:', error);
    return false;
  }
};

module.exports = connectDB;
