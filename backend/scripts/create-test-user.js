const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('../config/environment');

// MongoDB Atlas connection string
const MONGODB_ATLAS_URI = 'mongodb+srv://schedulify:9SBq8tC8mKPyYTdx@cluster0.blqlkgs.mongodb.net/schedulify?retryWrites=true&w=majority';

// Connect to the database (try env variable first, then fallback to Atlas)
const dbURI = env.MONGODB_URI || MONGODB_ATLAS_URI;

console.log('Connecting to MongoDB...');
mongoose.connect(dbURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  family: 4
})
.then(() => console.log('MongoDB Connected'))
.catch(err => {
  console.error('MongoDB connection error:', err);
  process.exit(1);
});

// Import the User model
const User = require('../models/user.model');

// Create a test user
async function createTestUser() {
  try {
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists.');
      
      // Ensure the user is verified
      if (!existingUser.isVerified) {
        existingUser.isVerified = true;
        await existingUser.save();
        console.log('User has been verified.');
      } else {
        console.log('User is already verified.');
      }
      
      console.log('You can log in with:');
      console.log('Email: test@example.com');
      console.log('Password: 123456');
      
      mongoose.disconnect();
      return;
    }
    
    // Create a new user
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    const newUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      authType: 'local',
      isVerified: true  // Set to verified immediately
    });
    
    await newUser.save();
    
    console.log('Test user created successfully!');
    console.log('You can log in with:');
    console.log('Email: test@example.com');
    console.log('Password: 123456');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test user:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

createTestUser(); 