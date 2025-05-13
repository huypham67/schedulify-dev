const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Use a direct connection string without SRV lookup
const MONGODB_URI = 'mongodb://schedulify:9SBq8tC8mKPyYTdx@ac-1nzrgyo-shard-00-00.blqlkgs.mongodb.net:27017,ac-1nzrgyo-shard-00-01.blqlkgs.mongodb.net:27017,ac-1nzrgyo-shard-00-02.blqlkgs.mongodb.net:27017/schedulify?ssl=true&replicaSet=atlas-13sqaj-shard-0&authSource=admin&retryWrites=true&w=majority';

// Simple User schema for this script only
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  firstName: String,
  lastName: String,
  isVerified: {
    type: Boolean,
    default: true
  },
  authType: {
    type: String,
    default: 'local'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Function to create a test user
async function createTestUser() {
  try {
    console.log('Connecting to MongoDB Atlas...');
    
    // Connect directly to MongoDB Atlas
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 15000
    });
    
    console.log('MongoDB connected successfully');
    
    // Create a User model
    const User = mongoose.model('User', userSchema);
    
    // Check if test user already exists
    const existingUser = await User.findOne({ email: 'test@example.com' });
    
    if (existingUser) {
      console.log('Test user already exists');
      console.log('Email: test@example.com');
      console.log('Password: 123456');
      await mongoose.connection.close();
      return;
    }
    
    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    // Create and save the user
    const newUser = new User({
      email: 'test@example.com',
      password: hashedPassword,
      firstName: 'Test',
      lastName: 'User',
      isVerified: true
    });
    
    await newUser.save();
    
    console.log('Test user created successfully');
    console.log('Email: test@example.com');
    console.log('Password: 123456');
    
    // Close the connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error);
    
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to error');
    }
    
    process.exit(1);
  }
}

// Run the function
createTestUser(); 