const mongoose = require('mongoose');
const env = require('../config/environment');
const User = require('../models/user.model');
const SocialAccount = require('../models/socialAccount.model');

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

// Sample data for Facebook page
const sampleFacebookPage = {
  platformId: 'page',
  platformUserId: '123456789012345',
  accessToken: 'EAAQZCqZAwrh0BAHZBZAMgW0v9rVhZBZBP7ZAoXoYG5ZC7CBtl9kDZAcnk0H9hDZCZBH8zxwT0BZCHZAaNjzq',
  accountName: 'Test Business Page',
  accountType: 'Business',
  profileImage: 'https://graph.facebook.com/123456789012345/picture',
  meta: {
    category: 'Business'
  }
};

// Sample data for Instagram account (connected to Facebook page)
const sampleInstagramAccount = {
  platformId: 'business',
  platformUserId: '98765432109876',
  accessToken: 'EAAQZCqZAwrh0BAGZBojW6lH2cUZBxhF6MZBhOAl0HZCP1NfuPZAHZAHJRZAGpkrKbKoL7l3s3EGz4Y',
  accountName: 'test_business_instagram',
  profileImage: 'https://instagram.com/profile-images/test_business_instagram.jpg',
  meta: {
    linkedFacebookPage: '123456789012345'
  }
};

// Create test social accounts for a user
async function createTestSocialAccounts() {
  try {
    // Find the test user
    const testUser = await User.findOne({ email: 'test@example.com' });
    
    if (!testUser) {
      console.log('Test user not found. Please run create-test-user.js first.');
      mongoose.disconnect();
      return;
    }
    
    // Check if accounts already exist
    const existingFBAccount = await SocialAccount.findOne({ 
      user: testUser._id, 
      platform: 'facebook',
      platformUserId: sampleFacebookPage.platformUserId
    });
    
    const existingIGAccount = await SocialAccount.findOne({ 
      user: testUser._id, 
      platform: 'instagram',
      platformUserId: sampleInstagramAccount.platformUserId
    });
    
    // Create Facebook account if doesn't exist
    if (!existingFBAccount) {
      const fbAccount = new SocialAccount({
        user: testUser._id,
        platform: 'facebook',
        ...sampleFacebookPage
      });
      
      await fbAccount.save();
      console.log('Facebook test account created successfully!');
    } else {
      console.log('Facebook test account already exists.');
    }
    
    // Create Instagram account if doesn't exist
    if (!existingIGAccount) {
      const igAccount = new SocialAccount({
        user: testUser._id,
        platform: 'instagram',
        ...sampleInstagramAccount
      });
      
      await igAccount.save();
      console.log('Instagram test account created successfully!');
    } else {
      console.log('Instagram test account already exists.');
    }
    
    console.log('Test social accounts created or already exist for user:', testUser.email);
    console.log('You can now test social integration endpoints with these accounts.');
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error creating test social accounts:', error);
    mongoose.disconnect();
    process.exit(1);
  }
}

createTestSocialAccounts(); 