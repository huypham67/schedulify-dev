/**
 * This script tests all API endpoints for Schedulify.
 * It includes authentication, social media integration, and posts management.
 * 
 * Usage: node scripts/test-all-apis.js
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// API base URL
const API_URL = `http://localhost:${process.env.PORT || 5000}`;

// Test credentials
const TEST_USER = {
  email: "testuser@example.com",
  password: "Password123",
  firstName: "Test",
  lastName: "User"
};

// Store tokens and IDs
let accessToken = "";
let refreshToken = "";
let userId = "";
let socialAccountIds = [];
let postIds = [];

// Helper for logging
const logSection = (title) => {
  console.log("\n" + "=".repeat(80));
  console.log(`TESTING: ${title}`);
  console.log("=".repeat(80));
};

const logResponse = (title, data) => {
  console.log(`\n--- ${title} ---`);
  console.log(typeof data === 'object' ? JSON.stringify(data, null, 2) : data);
};

const logError = (title, error) => {
  console.error(`\n!!! ERROR - ${title} !!!`);
  if (error.response) {
    console.error(`Status: ${error.response.status}`);
    console.error('Data:', error.response.data);
  } else {
    console.error(error.message);
  }
};

// Test authentication endpoints
async function testAuthEndpoints() {
  logSection("AUTHENTICATION ENDPOINTS");
  
  try {
    // 1. Register a new user
    logSection("1. Register User");
    try {
      const registerResponse = await axios.post(`${API_URL}/api/auth/register`, TEST_USER);
      logResponse("Register Response", registerResponse.data);
    } catch (error) {
      logError("Register", error);
      console.log("User might already exist, proceeding with login...");
    }
    
    // 2. Login
    logSection("2. Login");
    try {
      const loginResponse = await axios.post(`${API_URL}/api/auth/login`, {
        email: TEST_USER.email,
        password: TEST_USER.password
      });
      
      accessToken = loginResponse.data.accessToken;
      refreshToken = loginResponse.data.refreshToken;
      userId = loginResponse.data.user.id;
      
      logResponse("Login Response", loginResponse.data);
      console.log(`\nAccess Token: ${accessToken.substring(0, 20)}...`);
      console.log(`Refresh Token: ${refreshToken.substring(0, 20)}...`);
    } catch (error) {
      logError("Login", error);
      return false;
    }
    
    // 3. Get Current User
    logSection("3. Get Current User");
    try {
      const userResponse = await axios.get(`${API_URL}/api/auth/me`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      logResponse("Current User", userResponse.data);
    } catch (error) {
      logError("Get Current User", error);
    }
    
    // 4. Refresh Token
    logSection("4. Refresh Token");
    try {
      const refreshResponse = await axios.post(`${API_URL}/api/auth/refresh`, {
        refreshToken: refreshToken
      });
      
      // Update tokens
      accessToken = refreshResponse.data.accessToken;
      refreshToken = refreshResponse.data.refreshToken;
      
      logResponse("Refresh Token Response", refreshResponse.data);
      console.log(`\nNew Access Token: ${accessToken.substring(0, 20)}...`);
      console.log(`New Refresh Token: ${refreshToken.substring(0, 20)}...`);
    } catch (error) {
      logError("Refresh Token", error);
    }
    
    return true;
  } catch (error) {
    console.error("Failed to test auth endpoints:", error);
    return false;
  }
}

// Test social media endpoints
async function testSocialEndpoints() {
  logSection("SOCIAL MEDIA INTEGRATION ENDPOINTS");
  
  try {
    // 1. Get connected social accounts
    logSection("1. Get Social Accounts");
    try {
      const accountsResponse = await axios.get(`${API_URL}/api/social/accounts`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      logResponse("Social Accounts", accountsResponse.data);
      
      // Save account IDs
      if (accountsResponse.data.success && accountsResponse.data.data) {
        accountsResponse.data.data.forEach(account => {
          socialAccountIds.push({
            id: account._id,
            platform: account.platform,
            name: account.accountName
          });
        });
        
        if (socialAccountIds.length > 0) {
          console.log("\nFound Social Accounts:");
          socialAccountIds.forEach(account => {
            console.log(`- ${account.platform}: ${account.name} (${account.id})`);
          });
        } else {
          console.log("\nNo social accounts found. Creating test accounts...");
        }
      }
    } catch (error) {
      logError("Get Social Accounts", error);
    }
    
    // 2. Initialize Facebook Connection
    logSection("2. Initialize Facebook Connection");
    try {
      const fbInitResponse = await axios.get(`${API_URL}/api/social/connect/facebook`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      logResponse("Facebook Init Response", fbInitResponse.data);
    } catch (error) {
      logError("Initialize Facebook Connection", error);
    }
    
    // 3. Complete Facebook Connection (with mock token)
    logSection("3. Complete Facebook Connection");
    try {
      const mockFbToken = "EAAQZCqZAwrh0BAHZBZAMgW0v9rVhZBZBP7ZAoXoYG5ZC7CBtl9kDZAcnk0H9hDZCZBH8zxwT0BZCHZAaNjzq";
      
      const fbCompleteResponse = await axios.post(
        `${API_URL}/api/social/connect/facebook/callback/complete`,
        { accessToken: mockFbToken },
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      logResponse("Facebook Connection Complete", fbCompleteResponse.data);
      
      // Update social account IDs
      if (fbCompleteResponse.data.success && fbCompleteResponse.data.data) {
        fbCompleteResponse.data.data.forEach(account => {
          socialAccountIds.push({
            id: account._id,
            platform: account.platform,
            name: account.accountName
          });
        });
      }
    } catch (error) {
      logError("Complete Facebook Connection", error);
    }
    
    // 4. Get updated social accounts
    logSection("4. Get Updated Social Accounts");
    try {
      const updatedAccountsResponse = await axios.get(`${API_URL}/api/social/accounts`, {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      
      logResponse("Updated Social Accounts", updatedAccountsResponse.data);
      
      // Reset and update account IDs
      socialAccountIds = [];
      if (updatedAccountsResponse.data.success && updatedAccountsResponse.data.data) {
        updatedAccountsResponse.data.data.forEach(account => {
          socialAccountIds.push({
            id: account._id,
            platform: account.platform,
            name: account.accountName
          });
        });
        
        if (socialAccountIds.length > 0) {
          console.log("\nCurrent Social Accounts:");
          socialAccountIds.forEach(account => {
            console.log(`- ${account.platform}: ${account.name} (${account.id})`);
          });
        }
      }
    } catch (error) {
      logError("Get Updated Social Accounts", error);
    }
    
    // 5. Disconnect a social account (if available)
    if (socialAccountIds.length > 0) {
      logSection("5. Disconnect Social Account");
      
      // Pick one account to disconnect
      const accountToDisconnect = socialAccountIds[0];
      
      try {
        const disconnectResponse = await axios.delete(
          `${API_URL}/api/social/disconnect/${accountToDisconnect.id}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        logResponse(`Disconnect ${accountToDisconnect.platform} Account`, disconnectResponse.data);
      } catch (error) {
        logError(`Disconnect ${accountToDisconnect.platform} Account`, error);
      }
    } else {
      console.log("\nSkipping disconnect test - no social accounts available");
    }
    
    return true;
  } catch (error) {
    console.error("Failed to test social endpoints:", error);
    return false;
  }
}

// Test post management endpoints
async function testPostEndpoints() {
  logSection("POST MANAGEMENT ENDPOINTS");
  
  try {
    // 1. Create a new post
    logSection("1. Create a New Post");
    try {
      const newPost = {
        content: "This is a test post from the API test script",
        platforms: [],
        scheduledAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() // Tomorrow
      };
      
      const createResponse = await axios.post(
        `${API_URL}/api/posts`,
        newPost,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      logResponse("Create Post Response", createResponse.data);
      
      if (createResponse.data.success && createResponse.data.data) {
        postIds.push(createResponse.data.data._id);
        console.log(`\nCreated post with ID: ${createResponse.data.data._id}`);
      }
    } catch (error) {
      logError("Create Post", error);
    }
    
    // 2. Get all posts
    logSection("2. Get All Posts");
    try {
      const postsResponse = await axios.get(
        `${API_URL}/api/posts`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      );
      
      logResponse("All Posts", postsResponse.data);
      
      // Update post IDs if needed
      if (postsResponse.data.success && postsResponse.data.data) {
        if (postIds.length === 0 && postsResponse.data.data.length > 0) {
          postIds.push(postsResponse.data.data[0]._id);
          console.log(`\nFound existing post with ID: ${postsResponse.data.data[0]._id}`);
        }
      }
    } catch (error) {
      logError("Get All Posts", error);
    }
    
    // 3. Get a specific post (if available)
    if (postIds.length > 0) {
      logSection("3. Get Specific Post");
      const postId = postIds[0];
      
      try {
        const postResponse = await axios.get(
          `${API_URL}/api/posts/${postId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        logResponse("Post Details", postResponse.data);
      } catch (error) {
        logError("Get Specific Post", error);
      }
      
      // 4. Update a post
      logSection("4. Update Post");
      try {
        const updatePost = {
          content: "This is an updated test post from the API test script",
          platforms: [],
          scheduledAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString() // 2 days from now
        };
        
        const updateResponse = await axios.put(
          `${API_URL}/api/posts/${postId}`,
          updatePost,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        logResponse("Update Post Response", updateResponse.data);
      } catch (error) {
        logError("Update Post", error);
      }
      
      // 5. Schedule a post
      logSection("5. Schedule Post");
      try {
        const scheduleResponse = await axios.post(
          `${API_URL}/api/posts/${postId}/schedule`,
          { scheduledAt: new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString() },
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        logResponse("Schedule Post Response", scheduleResponse.data);
      } catch (error) {
        logError("Schedule Post", error);
      }
      
      // 6. Delete a post
      logSection("6. Delete Post");
      try {
        const deleteResponse = await axios.delete(
          `${API_URL}/api/posts/${postId}`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        );
        
        logResponse("Delete Post Response", deleteResponse.data);
      } catch (error) {
        logError("Delete Post", error);
      }
    } else {
      console.log("\nSkipping post detail, update, schedule, and delete tests - no posts available");
    }
    
    return true;
  } catch (error) {
    console.error("Failed to test post endpoints:", error);
    return false;
  }
}

// Test media upload endpoints
async function testMediaEndpoints() {
  logSection("MEDIA UPLOAD ENDPOINTS");
  
  try {
    // For media upload, we need a file
    const testImagePath = path.join(__dirname, 'test-image.jpg');
    const imageExists = fs.existsSync(testImagePath);
    
    if (!imageExists) {
      console.log("Test image not found. Skipping media upload tests.");
      return true;
    }
    
    // 1. Upload media
    logSection("1. Upload Media");
    try {
      const formData = new FormData();
      const fileStream = fs.createReadStream(testImagePath);
      formData.append('file', fileStream);
      
      const uploadResponse = await axios.post(
        `${API_URL}/api/media/upload`,
        formData,
        { 
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'multipart/form-data'
          } 
        }
      );
      
      logResponse("Upload Media Response", uploadResponse.data);
    } catch (error) {
      logError("Upload Media", error);
    }
    
    return true;
  } catch (error) {
    console.error("Failed to test media endpoints:", error);
    return false;
  }
}

// Finally, test logout
async function testLogout() {
  logSection("LOGOUT");
  
  try {
    const logoutResponse = await axios.post(
      `${API_URL}/api/auth/logout`,
      { refreshToken },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );
    
    logResponse("Logout Response", logoutResponse.data);
    return true;
  } catch (error) {
    logError("Logout", error);
    return false;
  }
}

// Main test function
async function runAllTests() {
  console.log("\n" + "*".repeat(100));
  console.log("SCHEDULIFY API TESTING SUITE");
  console.log("*".repeat(100));
  
  try {
    // Test auth endpoints first
    const authSuccess = await testAuthEndpoints();
    if (!authSuccess) {
      console.error("Authentication tests failed. Cannot proceed with other tests.");
      return;
    }
    
    // Test social endpoints
    await testSocialEndpoints();
    
    // Test post endpoints
    await testPostEndpoints();
    
    // Test media endpoints
    //await testMediaEndpoints(); // Commented out as it requires a test image
    
    // Test logout
    await testLogout();
    
    console.log("\n" + "*".repeat(100));
    console.log("API TESTING COMPLETED");
    console.log("*".repeat(100));
  } catch (error) {
    console.error("Test execution failed:", error);
  }
}

// Run all tests
runAllTests(); 