/**
 * This script mocks Facebook API responses for testing purposes.
 * It can be used to simulate API responses without actual Facebook API calls.
 * 
 * Usage: 
 * - Run this script directly: node scripts/mock-facebook-response.js
 * - Or import and use the functions in your tests
 */

// Mock response for /me/accounts endpoint
const mockUserPagesResponse = {
  "data": [
    {
      "id": "123456789012345",
      "name": "Test Business Page",
      "access_token": "EAAQZCqZAwrh0BAHZBZAMgW0v9rVhZBZBP7ZAoXoYG5ZC7CBtl9kDZAcnk0H9hDZCZBH8zxwT0BZCHZAaNjzq",
      "category": "Business",
      "picture": {
        "data": {
          "url": "https://graph.facebook.com/123456789012345/picture"
        }
      }
    },
    {
      "id": "987654321098765",
      "name": "Test Personal Page",
      "access_token": "EAAQZCqZAwrh0BAO2eZABSu1ZCBBtAjjYfRVXTpcZCx3tCO7N39lZBmzrPZBD3ZCZAQ12lvZBN51oKjPK",
      "category": "Personal Blog",
      "picture": {
        "data": {
          "url": "https://graph.facebook.com/987654321098765/picture"
        }
      }
    }
  ]
};

// Mock response for Instagram account connected to Facebook page
const mockInstagramAccountResponse = {
  "instagram_business_account": {
    "id": "98765432109876",
    "username": "test_business_instagram",
    "profile_picture_url": "https://instagram.com/profile-images/test_business_instagram.jpg"
  }
};

// Mock response for posting to Facebook
const mockFacebookPostResponse = {
  "id": "123456789012345_543210987654321"
};

// Mock response for Instagram container creation
const mockInstagramContainerResponse = {
  "id": "17895695648300273"
};

// Mock response for Instagram publish
const mockInstagramPublishResponse = {
  "id": "17851400123850293"
};

// Function to simulate API delay
const simulateApiDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// Export mock responses and functions for use in tests
module.exports = {
  mockUserPagesResponse,
  mockInstagramAccountResponse,
  mockFacebookPostResponse,
  mockInstagramContainerResponse,
  mockInstagramPublishResponse,
  simulateApiDelay,
  
  // Mock function for getUserPages
  getUserPages: async () => {
    await simulateApiDelay();
    return mockUserPagesResponse.data;
  },
  
  // Mock function for getInstagramAccount
  getInstagramAccount: async (pageId) => {
    await simulateApiDelay();
    
    // Only return Instagram account for the first page ID
    if (pageId === "123456789012345") {
      return mockInstagramAccountResponse.instagram_business_account;
    }
    
    return null;
  },
  
  // Mock function for posting to Facebook
  postToFacebook: async (postData) => {
    await simulateApiDelay();
    return mockFacebookPostResponse;
  },
  
  // Mock function for posting to Instagram
  postToInstagram: async (postData) => {
    await simulateApiDelay(1000); // Instagram is a bit slower :)
    
    // First create container
    const container = mockInstagramContainerResponse;
    
    // Then publish
    return mockInstagramPublishResponse;
  }
};

// If this script is run directly, log the mock data
if (require.main === module) {
  console.log("=== Facebook API Mock Data ===");
  console.log("\nUser Pages Response:");
  console.log(JSON.stringify(mockUserPagesResponse, null, 2));
  
  console.log("\nInstagram Account Response:");
  console.log(JSON.stringify(mockInstagramAccountResponse, null, 2));
  
  console.log("\nFacebook Post Response:");
  console.log(JSON.stringify(mockFacebookPostResponse, null, 2));
  
  console.log("\nInstagram Container Response:");
  console.log(JSON.stringify(mockInstagramContainerResponse, null, 2));
  
  console.log("\nInstagram Publish Response:");
  console.log(JSON.stringify(mockInstagramPublishResponse, null, 2));
  
  console.log("\nYou can use this data to mock Facebook API responses in your tests.");
} 