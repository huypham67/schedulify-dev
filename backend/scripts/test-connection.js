const mongoose = require('mongoose');

console.log('MongoDB connection test started...');
console.log('Mongoose version:', mongoose.version);

// Test local connection
const localURI = 'mongodb://localhost:27017/schedulify';
console.log('Attempting to connect to local MongoDB:', localURI);

mongoose.connect(localURI, { 
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000
})
.then(() => {
  console.log('Successfully connected to local MongoDB');
  testUserCollection();
})
.catch(err => {
  console.error('Failed to connect to local MongoDB:', err.message);
  testAtlasConnection();
});

// Test Atlas direct connection
function testAtlasConnection() {
  const atlasURI = 'mongodb://schedulify:9SBq8tC8mKPyYTdx@ac-1nzrgyo-shard-00-00.blqlkgs.mongodb.net:27017,ac-1nzrgyo-shard-00-01.blqlkgs.mongodb.net:27017,ac-1nzrgyo-shard-00-02.blqlkgs.mongodb.net:27017/schedulify?ssl=true&replicaSet=atlas-13sqaj-shard-0&authSource=admin&retryWrites=true&w=majority';
  console.log('Attempting to connect to MongoDB Atlas direct:', atlasURI);
  
  mongoose.connect(atlasURI, { 
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000
  })
  .then(() => {
    console.log('Successfully connected to MongoDB Atlas');
    testUserCollection();
  })
  .catch(err => {
    console.error('Failed to connect to MongoDB Atlas direct:', err.message);
    
    // Try standard Atlas connection
    const atlasSrvURI = 'mongodb+srv://schedulify:9SBq8tC8mKPyYTdx@cluster0.blqlkgs.mongodb.net/schedulify?retryWrites=true&w=majority';
    console.log('Attempting to connect to MongoDB Atlas SRV:', atlasSrvURI);
    
    mongoose.connect(atlasSrvURI, { 
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 5000
    })
    .then(() => {
      console.log('Successfully connected to MongoDB Atlas SRV');
      testUserCollection();
    })
    .catch(err => {
      console.error('Failed to connect to MongoDB Atlas SRV:', err.message);
      console.log('All MongoDB connection attempts failed');
      process.exit(1);
    });
  });
}

// Test User collection
async function testUserCollection() {
  try {
    // Check if User collection exists
    console.log('Testing User collection...');
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name).join(', '));
    
    // Create a simple schema for testing
    const userSchema = new mongoose.Schema({
      email: String,
      password: String,
      name: String
    });
    
    // Register the model
    const User = mongoose.model('User', userSchema);
    
    // Count documents
    const count = await User.countDocuments();
    console.log('User documents count:', count);
    
    // Try to find a user
    console.log('Trying to find a user with email test@example.com');
    const user = await User.findOne({ email: 'test@example.com' });
    console.log('Found user:', user ? 'Yes' : 'No');
    
    if (!user) {
      console.log('Creating a test user...');
      const testUser = new User({
        email: 'test@example.com',
        password: '$2a$10$5PXHGtbsIfwqxm3iOLGJL.h5a5xak2yUhPZf7H4S9BobLPapwq5x.',
        name: 'Test User'
      });
      await testUser.save();
      console.log('Test user created successfully');
    }
    
    console.log('Connection and collection tests completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('Error testing User collection:', error.message);
    process.exit(1);
  }
} 