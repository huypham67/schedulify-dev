const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Local MongoDB connection
const MONGODB_LOCAL_URI = 'mongodb://localhost:27017/schedulify';

// User schema matching your application's model
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

// Create and save test user
async function createLocalTestUser() {
  try {
    console.log('Connecting to local MongoDB...');
    
    // Connect to local MongoDB
    await mongoose.connect(MONGODB_LOCAL_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('Connected to local MongoDB');
    
    // Create User model
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
    
    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('123456', salt);
    
    // Create new user
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
    
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
  } catch (error) {
    console.error('Error:', error.message);
    
    if (mongoose.connection) {
      await mongoose.connection.close();
      console.log('MongoDB connection closed due to error');
    }
    
    process.exit(1);
  }
}

createLocalTestUser(); 