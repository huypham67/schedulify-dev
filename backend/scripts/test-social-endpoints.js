/**
 * This script tests the social media endpoints directly using axios.
 * It provides an easy way to test the API without using Postman.
 * 
 * Usage: node scripts/test-social-endpoints.js
 */

const axios = require('axios');
const env = require('../config/environment');

// API base URL
const API_URL = `http://localhost:${env.PORT || 5000}`;

// Test credentials
const TEST_USER = {
  email: 'test@example.com',
  password: '123456'
};

// Store token and account IDs
let accessToken;
let facebookAccountId;
let instagramAccountId;

// Helper function to log responses
const logResponse = (title, data) => {
  console.log(`\n=== ${title} ===`);
  console.log(JSON.stringify(data, null, 2));
};

// Helper function to handle errors
const handleError = (error) => {
  console.error('ERROR:', error.response?.data || error.message);
  process.exit(1);
};

// Test authentication and get token
const authenticate = async () => {
  try {
    console.log('Authenticating test user...');
    
    const response = await axios.post(`${API_URL}/api/auth/login`, TEST_USER);
    
    if (response.data.success && response.data.accessToken) {
      accessToken = response.data.accessToken;
      console.log('Authentication successful. Token obtained.');
      return true;
    } else {
      console.error('Failed to authenticate. No token received.');
      return false;
    }
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Test getting social accounts
const getSocialAccounts = async () => {
  try {
    console.log('\nGetting social accounts...');
    
    const response = await axios.get(`${API_URL}/api/social/accounts`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    logResponse('Social Accounts', response.data);
    
    // Save account IDs if accounts exist
    if (response.data.success && response.data.data?.length > 0) {
      const accounts = response.data.data;
      
      const fbAccount = accounts.find(acc => acc.platform === 'facebook');
      const igAccount = accounts.find(acc => acc.platform === 'instagram');
      
      if (fbAccount) facebookAccountId = fbAccount._id;
      if (igAccount) instagramAccountId = igAccount._id;
      
      console.log('Found accounts:');
      if (fbAccount) console.log(`- Facebook: ${fbAccount.accountName} (${fbAccount._id})`);
      if (igAccount) console.log(`- Instagram: ${igAccount.accountName} (${igAccount._id})`);
    }
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Test initializing Facebook connection
const initFacebookConnect = async () => {
  try {
    console.log('\nInitializing Facebook connection...');
    
    const response = await axios.get(`${API_URL}/api/social/connect/facebook`, {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    
    logResponse('Facebook Connect URL', response.data);
    
    if (response.data.success && response.data.data?.authUrl) {
      console.log(`\nTo continue OAuth flow manually, open this URL in your browser:`);
      console.log(response.data.data.authUrl);
      console.log('\nNote: For testing, you can skip the actual OAuth and use the mock token directly.');
    }
    
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Test completing Facebook connection with mock token
const completeFacebookConnection = async () => {
  try {
    console.log('\nCompleting Facebook connection with mock token...');
    
    const mockFacebookToken = 'EAAQZCqZAwrh0BAHZBZAMgW0v9rVhZBZBP7ZAoXoYG5ZC7CBtl9kDZAcnk0H9hDZCZBH8zxwT0BZCHZAaNjzq';
    
    const response = await axios.post(
      `${API_URL}/api/social/connect/facebook/callback/complete`,
      { accessToken: mockFacebookToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    logResponse('Facebook Connection Complete', response.data);
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Test disconnecting a social account
const disconnectSocialAccount = async (accountId, platform) => {
  if (!accountId) {
    console.log(`\nSkipping disconnect: No ${platform} account ID available.`);
    return false;
  }
  
  try {
    console.log(`\nDisconnecting ${platform} account (${accountId})...`);
    
    const response = await axios.delete(
      `${API_URL}/api/social/disconnect/${accountId}`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    logResponse(`${platform} Disconnect`, response.data);
    return true;
  } catch (error) {
    handleError(error);
    return false;
  }
};

// Run all tests
const runTests = async () => {
  try {
    console.log('Starting social endpoints test...');
    
    // First authenticate
    const authSuccess = await authenticate();
    if (!authSuccess) return;
    
    // Get current social accounts
    await getSocialAccounts();
    
    // Test Facebook connection initialization
    await initFacebookConnect();
    
    // Test completing connection with mock token
    await completeFacebookConnection();
    
    // Get updated social accounts
    await getSocialAccounts();
    
    // Test disconnecting (if account IDs are available)
    if (facebookAccountId) {
      await disconnectSocialAccount(facebookAccountId, 'Facebook');
    }
    
    if (instagramAccountId) {
      await disconnectSocialAccount(instagramAccountId, 'Instagram');
    }
    
    // Get final state of social accounts
    await getSocialAccounts();
    
    console.log('\nAll tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.message);
  }
};

// Start the tests
runTests(); 