const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const env = require('./environment');

// MongoDB connection options
const MONGODB_OPTIONS = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  useCreateIndex: true,
  useFindAndModify: false,
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
  family: 4
};

// Local MongoDB connection (working)
const MONGODB_LOCAL_URI = 'mongodb://localhost:27017/schedulify';

// Direct connection string for MongoDB Atlas (bypassing DNS SRV lookup)
const MONGODB_DIRECT_URI = 'mongodb://schedulify:9SBq8tC8mKPyYTdx@ac-1nzrgyo-shard-00-00.blqlkgs.mongodb.net:27017,ac-1nzrgyo-shard-00-01.blqlkgs.mongodb.net:27017,ac-1nzrgyo-shard-00-02.blqlkgs.mongodb.net:27017/schedulify?ssl=true&replicaSet=atlas-13sqaj-shard-0&authSource=admin&retryWrites=true&w=majority';

// Fallback to standard Atlas URI with SRV lookup
const MONGODB_ATLAS_URI = 'mongodb+srv://schedulify:9SBq8tC8mKPyYTdx@cluster0.blqlkgs.mongodb.net/schedulify?retryWrites=true&w=majority';

// Determine which URI to use (prefer local, then environment, then direct)
const mongoURI = MONGODB_LOCAL_URI;

// Mock User class with all necessary methods for development
class MockUser {
  constructor(data) {
    Object.assign(this, data);
  }

  async comparePassword(candidatePassword) {
    return bcrypt.compare(candidatePassword, this.password);
  }

  async save() {
    console.log('Mock save called for user:', this.email);
    return this;
  }
}

// Mock user for development mode
const mockUsers = [
  new MockUser({
    _id: 'mock123456789', 
    email: 'test@example.com',
    password: '$2a$10$5PXHGtbsIfwqxm3iOLGJL.h5a5xak2yUhPZf7H4S9BobLPapwq5x.', // hashed '123456'
    firstName: 'Test',
    lastName: 'User',
    isVerified: true,
    authType: 'local',
    createdAt: new Date(),
    refreshTokens: []
  })
];

// Function to set up mock database
const setupMockDB = () => {
  console.log('Using mock database for development');
  
  // Create a mock implementation for the User model
  const mockUserModel = {
    findOne: async (query) => {
      console.log('Mock DB: findOne query', JSON.stringify(query));
      
      if (query.email) {
        const user = mockUsers.find(user => user.email === query.email);
        console.log('Mock DB: Found user by email:', user ? user.email : 'none');
        return user ? new MockUser(user) : null;
      }
      
      if (query.verificationToken) {
        const user = mockUsers.find(user => user.verificationToken === query.verificationToken);
        console.log('Mock DB: verification token search');
        return user ? new MockUser(user) : null;
      }
      
      if (query.resetPasswordToken) {
        const user = mockUsers.find(user => user.resetPasswordToken === query.resetPasswordToken);
        console.log('Mock DB: reset token search');
        return user ? new MockUser(user) : null;
      }
      
      if (query['refreshTokens.token']) {
        const token = query['refreshTokens.token'];
        const user = mockUsers.find(u => u.refreshTokens && u.refreshTokens.some(rt => rt.token === token));
        console.log('Mock DB: refresh token search');
        return user ? new MockUser(user) : null;
      }
      
      return null;
    },
    findById: async (id) => {
      const user = mockUsers.find(user => user._id === id);
      console.log('Mock DB: findById', id, !!user);
      return user ? new MockUser(user) : null;
    },
    findByIdAndUpdate: async (id, update) => {
      console.log('Mock DB: findByIdAndUpdate', id, JSON.stringify(update));
      const user = mockUsers.find(user => user._id === id);
      
      if (user && update.$pull && update.$pull.refreshTokens) {
        const tokenToRemove = update.$pull.refreshTokens.token;
        user.refreshTokens = user.refreshTokens.filter(rt => rt.token !== tokenToRemove);
      }
      
      return user ? new MockUser(user) : null;
    }
  };
  
  // Create a mock User constructor to handle new User() calls
  function MockUserConstructor(userData) {
    return new MockUser(userData);
  }
  
  // Store mock model in mongoose
  mongoose.models = mongoose.models || {};
  mongoose.models.User = mockUserModel;
  
  // Replace the global User model
  global.User = MockUserConstructor;
  global.User.findOne = mockUserModel.findOne;
  global.User.findById = mockUserModel.findById;
  global.User.findByIdAndUpdate = mockUserModel.findByIdAndUpdate;
  
  return { connection: { host: 'mock-db' } };
};

const connectDB = async () => {
  // Check if we should use mock DB (only use if real DB connection fails)
  const useMockDB = env.NODE_ENV === 'development' && env.MOCK_DB === 'true';
  
  console.log('Attempting to connect to MongoDB...');
  
  try {
    // Connect to MongoDB
    const conn = await mongoose.connect(mongoURI, MONGODB_OPTIONS);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // Try environment variable URI if different
    if (mongoURI !== env.MONGODB_URI && env.MONGODB_URI) {
      try {
        console.log('Trying environment variable URI...');
        const conn = await mongoose.connect(env.MONGODB_URI, MONGODB_OPTIONS);
        console.log(`MongoDB Connected via env: ${conn.connection.host}`);
        return conn;
      } catch (envError) {
        console.error(`Environment URI connection failed: ${envError.message}`);
      }
    }
    
    // Try direct Atlas connection if different
    if (mongoURI !== MONGODB_DIRECT_URI) {
      try {
        console.log('Trying direct connection to MongoDB Atlas...');
        const conn = await mongoose.connect(MONGODB_DIRECT_URI, MONGODB_OPTIONS);
        console.log(`MongoDB Direct Connected: ${conn.connection.host}`);
        return conn;
      } catch (directError) {
        console.error(`Direct connection failed: ${directError.message}`);
      }
    }
    
    // Try standard Atlas connection as last resort if different
    if (mongoURI !== MONGODB_ATLAS_URI) {
      try {
        console.log('Trying standard MongoDB Atlas connection...');
        const conn = await mongoose.connect(MONGODB_ATLAS_URI, MONGODB_OPTIONS);
        console.log(`MongoDB Atlas Connected: ${conn.connection.host}`);
        return conn;
      } catch (atlasError) {
        console.error(`Atlas connection also failed: ${atlasError.message}`);
      }
    }
    
    // If all real DB connections fail and mock DB is enabled, use mock DB
    if (useMockDB) {
      console.log('All real database connections failed. Using mock database.');
      return setupMockDB();
    }
    
    // If all connection attempts fail, exit
    console.error('All MongoDB connection attempts failed. Exiting...');
    process.exit(1);
  }
};

module.exports = connectDB;
