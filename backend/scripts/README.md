# Testing Scripts

This directory contains various scripts for testing and setting up test data for the Schedulify backend API.

## Available Scripts

### User Scripts

- **`create-test-user.js`**: Creates a test user in the database with the following credentials:
  - Email: test@example.com
  - Password: 123456
  - The user is automatically verified

### Social Media Testing Scripts

- **`create-test-social-accounts.js`**: Creates sample Facebook and Instagram accounts for the test user
  - Requires the test user to exist (run `create-test-user.js` first)
  - Creates mock connections that can be used for testing

- **`mock-facebook-response.js`**: Provides mock data that simulates Facebook API responses
  - Can be run directly to see sample responses
  - Can be imported into other scripts to mock Facebook API

- **`test-social-endpoints.js`**: Automated script to test all social media endpoints
  - Authenticates as the test user
  - Tests retrieving social accounts
  - Tests the Facebook connection flow
  - Tests disconnecting accounts

### Postman Collection

- **`Schedulify.postman_collection.json`**: Postman collection for manual testing
  - Import this file into Postman
  - Contains requests for authentication and social media endpoints
  - Includes automatic token handling

## Usage

Most scripts can be run directly with Node.js:

```bash
node scripts/create-test-user.js
node scripts/create-test-social-accounts.js
node scripts/test-social-endpoints.js
```

The mock-facebook-response.js script can also be imported in your tests:

```javascript
const facebookMock = require('./scripts/mock-facebook-response.js');

// Use mock data
const pages = await facebookMock.getUserPages();
```

## Testing Flow

The recommended testing flow is:

1. Run `create-test-user.js` to create a test user
2. Run `create-test-social-accounts.js` to create test social accounts
3. Either:
   - Run `test-social-endpoints.js` for automated testing
   - Import the Postman collection for manual testing

## Notes

- These scripts are for development/testing purposes only
- Some scripts modify the database and should not be run in production
- The mock data is not real and won't work with actual Facebook APIs 